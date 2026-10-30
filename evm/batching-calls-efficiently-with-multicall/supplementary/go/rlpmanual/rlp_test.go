package rlpmanual

import (
	"bytes"
	"errors"
	"math/big"
	"reflect"
	"testing"

	gethrlp "github.com/ethereum/go-ethereum/rlp"
)

func TestCanonicalExamples(t *testing.T) {
	tests := []struct {
		name  string
		input any
		want  []byte
	}{
		{"dog", "dog", []byte{0x83, 'd', 'o', 'g'}},
		{"cat and dog", []string{"cat", "dog"}, []byte{0xc8, 0x83, 'c', 'a', 't', 0x83, 'd', 'o', 'g'}},
		{"empty string", "", []byte{0x80}},
		{"empty list", []any{}, []byte{0xc0}},
		{"zero integer", uint64(0), []byte{0x80}},
		{"single byte", uint64(15), []byte{0x0f}},
		{"1024", uint64(1024), []byte{0x82, 0x04, 0x00}},
		{"nested", []any{[]any{}, []any{[]any{}}}, []byte{0xc3, 0xc0, 0xc1, 0xc0}},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := Encode(test.input)
			if err != nil {
				t.Fatal(err)
			}
			if !bytes.Equal(got, test.want) {
				t.Fatalf("got %x, want %x", got, test.want)
			}

			decoded, err := Decode(got)
			if err != nil {
				t.Fatal(err)
			}
			if decoded == nil {
				t.Fatal("decoded value is nil")
			}
		})
	}
}

func TestLongStringMatchesGoEthereum(t *testing.T) {
	value := "Lorem ipsum dolor sit amet, consectetur adipisicing elit"
	got, err := Encode(value)
	if err != nil {
		t.Fatal(err)
	}
	want, err := gethrlp.EncodeToBytes(value)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, want) {
		t.Fatalf("manual %x differs from go-ethereum %x", got, want)
	}
}

func TestUint64DoesNotOverflowHostInt(t *testing.T) {
	got, err := Encode(uint64(^uint64(0)))
	if err != nil {
		t.Fatal(err)
	}
	want, err := gethrlp.EncodeToBytes(new(big.Int).SetUint64(^uint64(0)))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, want) {
		t.Fatalf("got %x, want %x", got, want)
	}
}

func TestDecodeNestedList(t *testing.T) {
	input := []byte{0xc7, 0xc0, 0xc1, 0xc0, 0xc3, 0xc0, 0xc1, 0xc0}
	want := []any{[]any{}, []any{[]any{}}, []any{[]any{}, []any{[]any{}}}}
	got, err := Decode(input)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
}

func TestDecodeRejectsNonCanonicalAndTrailingData(t *testing.T) {
	if _, err := Decode([]byte{0x81, 0x01}); !errors.Is(err, ErrNonCanonical) {
		t.Fatalf("expected non-canonical error, got %v", err)
	}
	if _, err := Decode([]byte{0x01, 0x02}); !errors.Is(err, ErrTrailingData) {
		t.Fatalf("expected trailing-data error, got %v", err)
	}
}
