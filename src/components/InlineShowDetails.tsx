import { View, Text, StyleSheet } from 'react-native';

interface IInlineShowDetails {
	show: {
		time: string;
		price: number;
		available: number;
		seatClasses?: Array<{
			code: string;
			name?: string;
			price: number;
			available: number;
		}>;
	};
}

export const InlineShowDetails = ({ show }: IInlineShowDetails) => {
	return (
		<View style={styles.detailBox}>
			<View style={styles.detailRow}>
				<Text style={styles.detailKey}>Price</Text>
				<Text style={styles.detailVal}>₹{show?.price}</Text>
			</View>
			<View style={styles.detailRow}>
				<Text style={styles.detailKey}>Available</Text>
				<Text style={styles.detailVal}>{show?.available}</Text>
			</View>

			{show.seatClasses && show.seatClasses.length > 0 && (
				<View style={styles.seatClassWrap}>
					{show.seatClasses.map((c) => (
						<View key={c.code} style={styles.seatClassRow}>
							<Text style={styles.seatClassName}>
								{c.name ?? c.code}
							</Text>
							<Text style={styles.seatClassPrice}>
								₹{c.price}
							</Text>
							<Text style={styles.seatClassAvail}>
								{c.available} left
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	detailBox: {
		marginTop: 10,
		backgroundColor: '#0f0f0f',
		borderRadius: 10,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#2a2a2a',
		padding: 10,
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	detailKey: { color: '#a3a3a3', fontSize: 13 },
	detailVal: { color: '#fff', fontSize: 14, fontWeight: '600' },

	seatClassWrap: { marginTop: 8, gap: 6 },
	seatClassRow: { flexDirection: 'row', justifyContent: 'space-between' },
	seatClassName: { color: '#eaeaea', fontSize: 13 },
	seatClassPrice: { color: '#eaeaea', fontSize: 13 },
	seatClassAvail: { color: '#bdbdbd', fontSize: 12 },
});
