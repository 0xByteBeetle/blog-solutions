package encode

import (
	"bytes"
	"encoding/hex"
	"testing"
)

func TestIntegerBoundaries(t *testing.T) {
	cases := []struct {
		value any
		hex   string
	}{
		{uint64(0), "80"}, {uint64(127), "7f"}, {uint64(128), "8180"},
		{uint64(1<<31 - 1), "847fffffff"}, {uint64(1 << 31), "8480000000"},
		{int64(1<<63 - 1), "887fffffffffffffff"}, {uint64(1 << 63), "888000000000000000"},
		{uint64(1<<64 - 1), "88ffffffffffffffff"},
		{[]any{uint64(1<<64 - 1)}, "c988ffffffffffffffff"},
	}
	for _, tc := range cases {
		want, err := hex.DecodeString(tc.hex)
		if err != nil {
			t.Fatal(err)
		}
		if got := RlpEncode(tc.value); !bytes.Equal(got, want) {
			t.Errorf("%v: got %x, want %x", tc.value, got, want)
		}
	}
}

func TestNegativeIntegerRejected(t *testing.T) {
	for _, value := range []any{int(-1), int64(-1), int64(-1 << 63)} {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("accepted negative %v", value)
				}
			}()
			RlpEncode(value)
		}()
	}
}
