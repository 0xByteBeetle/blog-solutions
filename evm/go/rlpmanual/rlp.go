package rlpmanual

import (
	"errors"
	"fmt"
	"math/big"
	"reflect"
)

var (
	ErrEmptyInput   = errors.New("rlp: empty input")
	ErrNonCanonical = errors.New("rlp: non-canonical encoding")
	ErrTrailingData = errors.New("rlp: trailing data")
)

// Encode implements the Recursive Length Prefix rules used by Ethereum.
// Lists are represented by Go slices other than []byte. Signed integers must
// be non-negative because RLP itself has no signed-integer type.
func Encode(input any) ([]byte, error) {
	switch value := input.(type) {
	case string:
		return encodeBytes([]byte(value)), nil
	case []byte:
		return encodeBytes(value), nil
	case *big.Int:
		if value == nil || value.Sign() < 0 {
			return nil, fmt.Errorf("rlp: expected non-negative integer")
		}
		return encodeBytes(value.Bytes()), nil
	case big.Int:
		if value.Sign() < 0 {
			return nil, fmt.Errorf("rlp: expected non-negative integer")
		}
		return encodeBytes(value.Bytes()), nil
	}

	reflected := reflect.ValueOf(input)
	if !reflected.IsValid() {
		return nil, fmt.Errorf("rlp: unsupported type <nil>")
	}

	switch reflected.Kind() {
	case reflect.Slice, reflect.Array:
		var payload []byte
		for index := 0; index < reflected.Len(); index++ {
			encoded, err := Encode(reflected.Index(index).Interface())
			if err != nil {
				return nil, fmt.Errorf("rlp: list item %d: %w", index, err)
			}
			payload = append(payload, encoded...)
		}
		return append(lengthPrefix(len(payload), 0xc0), payload...), nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		value := new(big.Int).SetUint64(reflected.Uint())
		return encodeBytes(value.Bytes()), nil
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		if reflected.Int() < 0 {
			return nil, fmt.Errorf("rlp: expected non-negative integer")
		}
		value := big.NewInt(reflected.Int())
		return encodeBytes(value.Bytes()), nil
	default:
		return nil, fmt.Errorf("rlp: unsupported type %T", input)
	}
}

func encodeBytes(value []byte) []byte {
	if len(value) == 1 && value[0] < 0x80 {
		return append([]byte(nil), value...)
	}
	return append(lengthPrefix(len(value), 0x80), value...)
}

func lengthPrefix(length int, offset byte) []byte {
	if length < 56 {
		return []byte{offset + byte(length)}
	}
	encodedLength := minimalBigEndian(uint64(length))
	return append([]byte{offset + 55 + byte(len(encodedLength))}, encodedLength...)
}

func minimalBigEndian(value uint64) []byte {
	if value == 0 {
		return nil
	}
	var buffer [8]byte
	index := len(buffer)
	for value != 0 {
		index--
		buffer[index] = byte(value)
		value >>= 8
	}
	return append([]byte(nil), buffer[index:]...)
}

// Decode returns either []byte or []any and rejects non-canonical encodings.
func Decode(input []byte) (any, error) {
	if len(input) == 0 {
		return nil, ErrEmptyInput
	}
	value, consumed, err := decodeItem(input)
	if err != nil {
		return nil, err
	}
	if consumed != len(input) {
		return nil, ErrTrailingData
	}
	return value, nil
}

func decodeItem(input []byte) (any, int, error) {
	if len(input) == 0 {
		return nil, 0, ErrEmptyInput
	}
	prefix := input[0]

	switch {
	case prefix <= 0x7f:
		return []byte{prefix}, 1, nil
	case prefix <= 0xb7:
		length := int(prefix - 0x80)
		if len(input) < 1+length {
			return nil, 0, errors.New("rlp: short string payload")
		}
		if length == 1 && input[1] < 0x80 {
			return nil, 0, ErrNonCanonical
		}
		return append([]byte(nil), input[1:1+length]...), 1 + length, nil
	case prefix <= 0xbf:
		lengthOfLength := int(prefix - 0xb7)
		length, err := readLongLength(input, lengthOfLength)
		if err != nil {
			return nil, 0, err
		}
		if length < 56 {
			return nil, 0, ErrNonCanonical
		}
		start := 1 + lengthOfLength
		if length > len(input)-start {
			return nil, 0, errors.New("rlp: long string payload")
		}
		return append([]byte(nil), input[start:start+length]...), start + length, nil
	case prefix <= 0xf7:
		length := int(prefix - 0xc0)
		if len(input) < 1+length {
			return nil, 0, errors.New("rlp: short list payload")
		}
		items, err := decodeList(input[1 : 1+length])
		return items, 1 + length, err
	default:
		lengthOfLength := int(prefix - 0xf7)
		length, err := readLongLength(input, lengthOfLength)
		if err != nil {
			return nil, 0, err
		}
		if length < 56 {
			return nil, 0, ErrNonCanonical
		}
		start := 1 + lengthOfLength
		if length > len(input)-start {
			return nil, 0, errors.New("rlp: long list payload")
		}
		items, err := decodeList(input[start : start+length])
		return items, start + length, err
	}
}

func readLongLength(input []byte, lengthOfLength int) (int, error) {
	if lengthOfLength <= 0 || lengthOfLength > 8 || len(input) < 1+lengthOfLength {
		return 0, errors.New("rlp: invalid length prefix")
	}
	if input[1] == 0 {
		return 0, ErrNonCanonical
	}
	var length uint64
	for _, value := range input[1 : 1+lengthOfLength] {
		length = length<<8 | uint64(value)
	}
	if uint64(int(length)) != length {
		return 0, errors.New("rlp: payload too large")
	}
	return int(length), nil
}

func decodeList(payload []byte) ([]any, error) {
	items := make([]any, 0)
	for len(payload) != 0 {
		item, consumed, err := decodeItem(payload)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
		payload = payload[consumed:]
	}
	return items, nil
}
