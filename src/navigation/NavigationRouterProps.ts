import { TBenchmarkFormState } from '../types/inventoryTypes';

export type TNavigationRouterProps = {
	HomeScreen: {};
	RNParserScreen: {
		params: TBenchmarkFormState;
	};
	NativeParserScreen: {
		params: TBenchmarkFormState;
	};
};
