// Supplemental boundary-corrected variant; see ../../README.md.
package decode

import (
	"errors"
)

// RlpDecode decodes an RLP-encoded byte slice into a Go value.
// It returns either a []byte or a []any representing a list.
func RlpDecode(input []byte) (interface{}, error) {
	val, consumed, err := decodeItem(input)
	if err != nil {
		return nil, err
	}
	if consumed != len(input) {
		return nil, errors.New("trailing bytes after RLP value")
	}
	return val, nil
}

// decodeItem handles a single RLP value, which could be:
// - a single byte
// - a string (short or long)
// - a list (short or long)
func decodeItem(data []byte) (any, int, error) {
	if len(data) == 0 {
		return nil, 0, errors.New("empty input")
	}

	prefix := data[0]

	switch {
	// Case 1: single byte (0x00 to 0x7f) — value is the byte itself
	case prefix <= 0x7f:
		return data[:1], 1, nil

	// Case 2: short string (0x80 to 0xb7)
	// The first byte = 0x80 + length of the string
	case prefix <= 0xb7:
		strLen := int(prefix - 0x80)
		if len(data) < 1+strLen {
			return nil, 0, errors.New("short string too short")
		}
		return data[1 : 1+strLen], 1 + strLen, nil

	// Case 3: long string (0xb8 to 0xbf)
	// The first byte = 0xb7 + length of length (lenOfLen)
	// Next lenOfLen bytes = actual length of the string
	case prefix <= 0xbf:
		lenOfLen := int(prefix - 0xb7)
		if len(data) < 1+lenOfLen {
			return nil, 0, errors.New("long string length prefix too short")
		}
		strLen, err := decodeLength(data[1:1+lenOfLen], len(data)-1-lenOfLen)
		if err != nil {
			return nil, 0, err
		}
		if len(data) < 1+lenOfLen+strLen {
			return nil, 0, errors.New("long string too short")
		}
		return data[1+lenOfLen : 1+lenOfLen+strLen], 1 + lenOfLen + strLen, nil

	// Case 4: short list (0xc0 to 0xf7)
	// First byte = 0xc0 + total payload length of encoded items
	case prefix <= 0xf7:
		listLen := int(prefix - 0xc0)
		if len(data) < 1+listLen {
			return nil, 0, errors.New("short list too short")
		}
		items, err := decodeList(data[1 : 1+listLen])
		return items, 1 + listLen, err

	// Case 5: long list (0xf8 to 0xff)
	// First byte = 0xf7 + length of length (lenOfLen)
	// Next lenOfLen bytes = actual length of list payload
	default:
		lenOfLen := int(prefix - 0xf7)
		if len(data) < 1+lenOfLen {
			return nil, 0, errors.New("long list length prefix too short")
		}
		listLen, err := decodeLength(data[1:1+lenOfLen], len(data)-1-lenOfLen)
		if err != nil {
			return nil, 0, err
		}
		if len(data) < 1+lenOfLen+listLen {
			return nil, 0, errors.New("long list too short")
		}
		items, err := decodeList(data[1+lenOfLen : 1+lenOfLen+listLen])
		return items, 1 + lenOfLen + listLen, err
	}
}

// decodeList walks through a byte slice that represents a list payload,
// recursively decoding each RLP item in the list.
func decodeList(data []byte) ([]any, error) {
	// Should return an empty slice instead of nil
	if len(data) == 0 {
		return []any{}, nil // Return empty slice instead of nil
	}

	var result []any
	for len(data) > 0 {
		val, consumed, err := decodeItem(data)
		if err != nil {
			return nil, err
		}
		result = append(result, val)
		data = data[consumed:]
	}
	return result, nil
}

// decodeLength interprets a big-endian byte slice as an integer length.
// This is used for long strings/lists where the length is itself encoded.
// Bound the declared length to the available payload BEFORE converting to int.
// Subtraction is safe: callers have already checked the complete length prefix.
func decodeLength(b []byte, available int) (int, error) {
	var n uint64
	for _, by := range b {
		n = (n << 8) | uint64(by)
	}
	if n > uint64(available) {
		return 0, errors.New("declared length exceeds available payload")
	}
	return int(n), nil
}
