# Published examples

Source: https://andreyobruchkov1996.substack.com/p/what-is-recursive-length-prefix-rlp

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `9c4cd0fed17aae7d3e816ae6657e95b14ea4a38ba84d3f50a20b36f20f1a80c7`

````text
func RlpEncode(input any) []byte {
 switch v := input.(type) {
 case string:
  data := []byte(v)
  if len(data) == 1 && data[0] < 0x80 {
   return data
  }
  return append(encodeLength(len(data), 0x80), data...)
case []byte:
  if len(v) == 1 && v[0] < 0x80 {
   return v
  }
  return append(encodeLength(len(v), 0x80), v...)
 default:
  // Handle slices of any type (e.g., []string, []int, []any)
  reflectedValue := reflect.ValueOf(input)
  kind := reflectedValue.Kind()
  if reflectedValue.Kind() == reflect.Slice {
   var output []byte
   for i := 0; i < reflectedValue.Len(); i++ {
    item := reflectedValue.Index(i).Interface()
    output = append(output, RlpEncode(item)...)
   }
   return append(encodeLength(len(output), 0xc0), output...)
  }
  // Handle all integer kinds (signed and unsigned)
  if isIntegerKind(kind) {
   n := toInt(reflectedValue)
   if n == 0 {
    return []byte{0x80}
   }
   return encodeInteger(n)
  }
  panic(fmt.Sprintf(”unsupported type: %T”, input))
 }
}

func encodeLength(length int, offset int) []byte {
 if length < 56 {
  return []byte{byte(length + offset)}
 }
 l := big.NewInt(int64(length))
 limit := new(big.Int).Lsh(big.NewInt(1), 64) // 2^64
 // len more than 2^64 are not allowed
 if l.Cmp(limit) >= 0 {
  panic(”input too long”)
 }
 bl := toBinary(length)
 return append([]byte{byte(len(bl) + offset + 55)}, bl...)
}

func toBinary(x int) []byte {
 if x == 0 {
  return []byte{}
 }
 var buf bytes.Buffer
 for x > 0 {
  buf.WriteByte(byte(x & 0xff))
  x >>= 8
 }
 // Reverse to make big-endian
 b := buf.Bytes()
 for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
  b[i], b[j] = b[j], b[i]
 }
 return b
}

func encodeInteger(n int) []byte {
 if n < 0 {
  panic(”RLP only supports unsigned integers”)
 }
 buf := toBinary(n)
 if len(buf) == 1 && buf[0] < 0x80 {
  return buf
 }
 return append(encodeLength(len(buf), 0x80), buf...)
}
func isIntegerKind(kind reflect.Kind) bool {
 switch kind {
 case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
  reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
  return true
 default:
  return false
 }
}
func toInt(v reflect.Value) int {
 // Convert to int (you can use int64 if you want bigger range)
 switch v.Kind() {
 case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
  return int(v.Int())
 case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
  return int(v.Uint())
 default:
  panic(”not an integer kind”)
 }
}  
````

## Block 2

SHA-256: `adc3b2c3e8b77794e033172c947601186dac4d5a7330e8a67ea7610cf829220c`

````text
func TestRLPEncoding(t *testing.T) {
 tests := map[string]struct {
  input    any
  expected []byte
 }{
  “string dog”: {
   input:    “dog”,
   expected: []byte{0x83, ‘d’, ‘o’, ‘g’},
  },
  “list [cat, dog]”: {
   input:    []string{”cat”, “dog”},
   expected: []byte{0xc8, 0x83, ‘c’, ‘a’, ‘t’, 0x83, ‘d’, ‘o’, ‘g’},
  },
  “bytes”: {
   input:    []byte(”dog”),
   expected: []byte{0x83, ‘d’, ‘o’, ‘g’},
  },
  “empty string”: {
   input:    “”,
   expected: []byte{0x80},
  },
  “empty list”: {
   input:    []any{},
   expected: []byte{0xc0},
  },
  “integer 0”: {
   input:    0,
   expected: []byte{0x80},
  },
  “integer 15”: {
   input:    15,
   expected: []byte{0x0f},
  },
  “integer 1024”: {
   input:    1024,
   expected: []byte{0x82, 0x04, 0x00},
  },
  “byte 0x00”: {
   input:    []byte{0x00},
   expected: []byte{0x00},
  },
  “byte 0x0f”: {
   input:    []byte{0x0f},
   expected: []byte{0x0f},
  },
  “bytes 0x04 0x00”: {
   input:    []byte{0x04, 0x00},
   expected: []byte{0x82, 0x04, 0x00},
  },
  “set theoretical representation [ [], [[]], [ [], [[]] ] ]”: {
   input: []any{
    []any{},
    []any{[]any{}},
    []any{
     []any{},
     []any{[]any{}},
    },
   },
   expected: []byte{0xc7, 0xc0, 0xc1, 0xc0, 0xc3, 0xc0, 0xc1, 0xc0},
  },
  “long string Lorem ipsum...”: {
   input:    “Lorem ipsum dolor sit amet, consectetur adipisicing elit”,
   expected: append([]byte{0xb8, 0x38}, []byte(”Lorem ipsum dolor sit amet, consectetur adipisicing elit”)...),
  },
 }

 for name, tt := range tests {
  t.Run(name, func(t *testing.T) {
   result := RlpEncode(tt.input)
   if !reflect.DeepEqual(result, tt.expected) {
    t.Errorf(”Encode(%v) = %v, want %v”, tt.input, result, tt.expected)
    t.Errorf(”Encode(%v) = %x, want %x”, tt.input, result, tt.expected)
   }
  })
 }
}
````

## Block 3

SHA-256: `335ea67389f2834c78548ded12d7575e3443f77c0c3dc31e64a13bf34d6e9ed7`

````text
// RlpDecode decodes an RLP-encoded byte slice into a Go value.
// It returns either a []byte or a []any representing a list.
func RlpDecode(input []byte) (interface{}, error) {
 val, _, err := decodeItem(input)
 return val, err
}

// decodeItem handles a single RLP value, which could be:
// - a single byte
// - a string (short or long)
// - a list (short or long)
func decodeItem(data []byte) (any, int, error) {
 if len(data) == 0 {
  return nil, 0, errors.New(”empty input”)
 }
 prefix := data[0]
 switch {
 // Case 1: single byte (0x00 to 0x7f) - value is the byte itself
 case prefix <= 0x7f:
  return data[:1], 1, nil
 // Case 2: short string (0x80 to 0xb7)
 // The first byte = 0x80 + length of the string
 case prefix <= 0xb7:
  strLen := int(prefix - 0x80)
  if len(data) < 1+strLen {
   return nil, 0, errors.New(”short string too short”)
  }
  return data[1 : 1+strLen], 1 + strLen, nil
 // Case 3: long string (0xb8 to 0xbf)
 // The first byte = 0xb7 + length of length (lenOfLen)
 // Next lenOfLen bytes = actual length of the string
 case prefix <= 0xbf:
  lenOfLen := int(prefix - 0xb7)
  if len(data) < 1+lenOfLen {
   return nil, 0, errors.New(”long string length prefix too short”)
  }
  strLen := decodeLength(data[1 : 1+lenOfLen])
  if len(data) < 1+lenOfLen+strLen {
   return nil, 0, errors.New(”long string too short”)
  }
  return data[1+lenOfLen : 1+lenOfLen+strLen], 1 + lenOfLen + strLen, nil
 // Case 4: short list (0xc0 to 0xf7)
 // First byte = 0xc0 + total payload length of encoded items
 case prefix <= 0xf7:
  listLen := int(prefix - 0xc0)
  if len(data) < 1+listLen {
   return nil, 0, errors.New(”short list too short”)
  }
  items, err := decodeList(data[1 : 1+listLen])
  return items, 1 + listLen, err
 // Case 5: long list (0xf8 to 0xff)
 // First byte = 0xf7 + length of length (lenOfLen)
 // Next lenOfLen bytes = actual length of list payload
 default:
  lenOfLen := int(prefix - 0xf7)
  if len(data) < 1+lenOfLen {
   return nil, 0, errors.New(”long list length prefix too short”)
  }
  listLen := decodeLength(data[1 : 1+lenOfLen])
  if len(data) < 1+lenOfLen+listLen {
   return nil, 0, errors.New(”long list too short”)
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
func decodeLength(b []byte) int {
 n := 0
 for _, by := range b {
  // Shift left and add next byte (big-endian)
  n = (n << 8) + int(by)
 }
 return n
}
````

## Block 4

SHA-256: `590523f1a76d8610bfb3dd9525f5012d41c44c0bd1fd9c5a4b9f3c0958ad3abe`

````text
func TestRLPDecoding(t *testing.T) {
 tests := map[string]struct {
  input    []byte
  expected any
 }{
  “string dog”: {
   input:    []byte{0x83, ‘d’, ‘o’, ‘g’},
   expected: []byte(”dog”),
  },
  “list [cat, dog]”: {
   input: []byte{0xc8, 0x83, ‘c’, ‘a’, ‘t’, 0x83, ‘d’, ‘o’, ‘g’},
   expected: []any{
    []byte(”cat”),
    []byte(”dog”),
   },
  },
  “bytes”: {
   input:    []byte{0x83, ‘d’, ‘o’, ‘g’},
   expected: []byte(”dog”),
  },
  “empty string”: {
   input:    []byte{0x80},
   expected: []byte{},
  },
  “empty list”: {
   input:    []byte{0xc0},
   expected: []any{},
  },
  “integer 0”: {
   input:    []byte{0x80},
   expected: []byte{},
  },
  “integer 15”: {
   input:    []byte{0x0f},
   expected: []byte{0x0f},
  },
  “integer 1024”: {
   input:    []byte{0x82, 0x04, 0x00},
   expected: []byte{0x04, 0x00},
  },
  “byte 0x00”: {
   input:    []byte{0x00},
   expected: []byte{0x00},
  },
  “byte 0x0f”: {
   input:    []byte{0x0f},
   expected: []byte{0x0f},
  },
  “bytes 0x04 0x00”: {
   input:    []byte{0x82, 0x04, 0x00},
   expected: []byte{0x04, 0x00},
  },
  “set theoretical representation [ [], [[]], [ [], [[]] ] ]”: {
   input: []byte{0xc7, 0xc0, 0xc1, 0xc0, 0xc3, 0xc0, 0xc1, 0xc0},
   expected: []any{
    []any{},
    []any{[]any{}},
    []any{
     []any{},
     []any{[]any{}},
    },
   },
  },
  “long string Lorem ipsum...”: {
   input:    append([]byte{0xb8, 0x38}, []byte(”Lorem ipsum dolor sit amet, consectetur adipisicing elit”)...),
   expected: []byte(”Lorem ipsum dolor sit amet, consectetur adipisicing elit”),
  },
 }

 for name, tt := range tests {
  t.Run(name, func(t *testing.T) {
   val, err := RlpDecode(tt.input)
   if err != nil {
    t.Fatalf(”RlpDecode failed: %v”, err)
   }

   switch expected := tt.expected.(type) {
   case []byte:
    actual, ok := val.([]byte)
    if !ok {
     t.Fatalf(”Expected []byte, got %T”, val)
    }
    if !reflect.DeepEqual(actual, expected) {
     t.Errorf(”Decoded []byte = %x, want %x”, actual, expected)
    }

   case []any:
    actual, ok := val.([]any)
    if !ok {
     t.Fatalf(”Expected []any, got %T”, val)
    }
    if !reflect.DeepEqual(actual, expected) {
     t.Errorf(”Decoded list = %#v\nExpected list = %#v”, actual, expected)
    }

   default:
    t.Fatalf(”Unsupported expected type: %T”, expected)
   }
  })
 }
}
````
