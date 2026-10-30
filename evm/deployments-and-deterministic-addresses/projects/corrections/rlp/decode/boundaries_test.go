package decode

import (
	"bytes"
	"reflect"
	"testing"
)

func TestConsumesExactlyOneValue(t *testing.T) {
	for _, data := range [][]byte{{0x01, 0x02}, {0x80, 0x80}, {0xc0, 0x80}, {0xc1, 0x01, 0x02}} {
		if _, err := RlpDecode(data); err == nil {
			t.Errorf("accepted trailing data %x", data)
		}
	}
	got, err := RlpDecode([]byte{0xc2, 0x01, 0x02})
	if err != nil || !reflect.DeepEqual(got, []any{[]byte{1}, []byte{2}}) {
		t.Fatalf("valid list: %v %v", got, err)
	}
}

func TestHugeOrTruncatedLengthReturnsError(t *testing.T) {
	for _, data := range [][]byte{
		{}, {0x82, 1}, {0xb8}, {0xb8, 56}, {0xf8, 56},
		{0xbf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff},
		{0xff, 0x80, 0, 0, 0, 0, 0, 0, 0},
		{0xfb, 0x80, 0, 0, 0},
	} {
		// Any panic is a test failure, not a substitute for a returned error.
		if _, err := RlpDecode(data); err == nil {
			t.Errorf("accepted invalid length %x", data)
		}
	}
}

func TestValidLongPayloads(t *testing.T) {
	payload := bytes.Repeat([]byte{0x01}, 56)
	got, err := RlpDecode(append([]byte{0xb8, 56}, payload...))
	if err != nil || !reflect.DeepEqual(got, payload) {
		t.Fatalf("long string: %v %v", got, err)
	}
	got, err = RlpDecode(append([]byte{0xf8, 56}, payload...))
	if err != nil {
		t.Fatal(err)
	}
	list, ok := got.([]any)
	if !ok || len(list) != 56 {
		t.Fatalf("long list: %v", got)
	}
	for _, item := range list {
		if !reflect.DeepEqual(item, []byte{1}) {
			t.Fatalf("list item: %v", item)
		}
	}
}
