export interface xAppBlock {
	Number:            number;
	Hash:              string;
	ParentHash:        string;
	Miner:             string;
	Size:              number;
	GasLimit:          number;
	GasUsed:           number;
	Timestamp:         Date;
	TransactionsCount: number;
	StateRoot:         string;
	TransactionsRoot:  string;
	Transactions:      string[];
}
