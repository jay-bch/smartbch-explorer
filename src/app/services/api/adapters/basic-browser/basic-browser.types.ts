export interface RequestInfo {
	Jsonrpc: string;
	Method:  string;
	Params:  {}[];
	Id:      number;
}

export interface ErrorInfo {
	Code:    number;
	Message: string;
}

export interface ResponseInfo {
	Jsonrpc: string;
	Id:      number;
	Result:  any;
	Error:   ErrorInfo;
}

export interface BasicBrowserBlock {
	Number:            string;
	Hash:              string;
	ParentHash:        string;
	Miner:             string;
	Size:              string;
	GasLimit:          number;
	GasUsed:           string;
	Timestamp:         string;
	TransactionsCount: string;
	BlockReward:       string;
	StateRoot:         string;
	TransactionsRoot:  string;
	Transactions:      string[];
}

export interface BasicBrowserTxs {
  Block: string;
  Transactions: BasicBrowserTransactionBasicInfo[];
}

export interface BasicBrowserAccount {
  Balance: string;
  Transactions: BasicBrowserTransactionBasicInfo[];
}

export interface BasicBrowserTransactionBasicInfo {
	Hash:        string;
	BlockNumber: string;
	From:        string;
	To:          string;
	Age:         string;
	Value:       string;
}