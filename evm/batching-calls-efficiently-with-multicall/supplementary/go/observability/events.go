package observability

import (
	"context"
	"errors"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
)

var TransferTopic = crypto.Keccak256Hash([]byte("Transfer(address,address,uint256)"))

type Transfer struct {
	Token common.Address
	From  common.Address
	To    common.Address
	Value *big.Int
}

func DecodeTransfer(log types.Log) (Transfer, error) {
	if len(log.Topics) != 3 || log.Topics[0] != TransferTopic || len(log.Data) != 32 {
		return Transfer{}, errors.New("log is not an ERC-20 Transfer")
	}
	return Transfer{
		Token: log.Address,
		From:  common.BytesToAddress(log.Topics[1].Bytes()[12:]),
		To:    common.BytesToAddress(log.Topics[2].Bytes()[12:]),
		Value: new(big.Int).SetBytes(log.Data),
	}, nil
}

func StreamTransfers(
	ctx context.Context,
	logs <-chan types.Log,
	from *common.Address,
	to *common.Address,
	handle func(Transfer) error,
) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case log, ok := <-logs:
			if !ok {
				return nil
			}
			transfer, err := DecodeTransfer(log)
			if err != nil {
				continue
			}
			if from != nil && transfer.From != *from {
				continue
			}
			if to != nil && transfer.To != *to {
				continue
			}
			if err := handle(transfer); err != nil {
				return err
			}
		}
	}
}

type CallFrame struct {
	Type  string      `json:"type"`
	From  string      `json:"from"`
	To    string      `json:"to"`
	Value string      `json:"value"`
	Calls []CallFrame `json:"calls"`
}

type NativeTransfer struct {
	Kind  string
	From  common.Address
	To    common.Address
	Value *big.Int
	Depth int
}

func CollectNativeTransfers(root CallFrame) ([]NativeTransfer, error) {
	transfers := make([]NativeTransfer, 0)
	var walk func(CallFrame, int) error
	walk = func(frame CallFrame, depth int) error {
		value := new(big.Int)
		encoded := strings.TrimPrefix(frame.Value, "0x")
		if encoded != "" {
			if _, ok := value.SetString(encoded, 16); !ok {
				return errors.New("invalid trace value")
			}
		}
		if value.Sign() > 0 {
			transfers = append(transfers, NativeTransfer{
				Kind:  frame.Type,
				From:  common.HexToAddress(frame.From),
				To:    common.HexToAddress(frame.To),
				Value: value,
				Depth: depth,
			})
		}
		for _, child := range frame.Calls {
			if err := walk(child, depth+1); err != nil {
				return err
			}
		}
		return nil
	}
	return transfers, walk(root, 0)
}
