// /emails/FieldRow.js
import { Section, Text, Link } from '@react-email/components';

export function FieldRow({
	field,
	value,
	colors,
	isLast = false,
	compact = false,
}) {
	const rowStyle = compact
		? { margin: 0, padding: '0 0 16px' }
		: {
				margin: 0,
				padding: '14px 0',
				borderBottom: isLast ? 'none' : '1px solid #e5e7eb',
			};
	const labelStyle = {
		fontWeight: 600,
		color: colors.text,
		fontSize: '14px',
		margin: '0 0 4px',
	};
	const valueStyle = {
		color: colors.text,
		fontSize: '14px',
		margin: 0,
		wordBreak: 'break-word',
	};
	const mutedStyle = {
		color: colors.textMuted,
		fontStyle: 'italic',
		fontSize: '14px',
		margin: 0,
	};
	const linkStyle = {
		color: colors.text,
		textDecoration: 'underline',
		fontWeight: 500,
		wordBreak: 'break-all',
	};
	const descriptionStyle = {
		backgroundColor: colors.background,
		borderLeft: `3px solid ${colors.accent}`,
		padding: '16px',
		marginTop: '8px',
		color: colors.text,
		fontSize: '14px',
		lineHeight: '1.6',
		borderRadius: '4px',
	};

	const renderValue = () => {
		if (!value || value === 'Not provided') {
			return <Text style={mutedStyle}>Not provided</Text>;
		}
		switch (field.type) {
			case 'email':
				return (
					<Link href={`mailto:${value}`} style={linkStyle}>
						{value}
					</Link>
				);
			case 'tel':
				return (
					<Link href={`tel:${value}`} style={linkStyle}>
						{value}
					</Link>
				);
			case 'textarea':
				return <Text style={descriptionStyle}>{value}</Text>;
			case 'radio': {
				const match = field.options?.find((opt) => opt.value === value);
				return <Text style={valueStyle}>{match ? match.label : value}</Text>;
			}
			default:
				return <Text style={valueStyle}>{value}</Text>;
		}
	};

	return (
		<Section style={rowStyle}>
			<Text style={labelStyle}>{field.label}:</Text>
			{renderValue()}
		</Section>
	);
}
