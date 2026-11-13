// /emails/AutoResponseEmail.jsx
import {
	Heading,
	Text,
	Section,
	Row,
	Column,
	Hr,
} from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { FieldRow } from './FieldRow';
import {
	previewBranding,
	previewFields,
	previewFormData,
	previewMessaging,
	previewTimestamp,
} from './previewData';

const GRID_EXCLUDED_TYPES = ['textarea', 'radio'];

function chunkIntoPairs(arr) {
	const pairs = [];
	for (let i = 0; i < arr.length; i += 2) {
		pairs.push(arr.slice(i, i + 2));
	}
	return pairs;
}

export default function AutoResponseEmail({
	branding = previewBranding,
	fields = previewFields,
	formData = previewFormData,
	messaging = previewMessaging,
	timestamp = previewTimestamp,
}) {
	const { colors, contactInfo } = branding;
	const { name } = formData;

	const gridFields = fields.filter(
		(f) => !GRID_EXCLUDED_TYPES.includes(f.type),
	);
	const fullWidthFields = fields.filter((f) =>
		GRID_EXCLUDED_TYPES.includes(f.type),
	);
	const gridPairs = chunkIntoPairs(gridFields);

	const footer = (
		<Text style={footerText(colors)}>
			Need immediate help?
			<br />
			Call us at{' '}
			<a href={`tel:${contactInfo.phone}`} style={footerLink(colors)}>
				{contactInfo.phone}
			</a>
		</Text>
	);

	return (
		<EmailLayout
			branding={branding}
			previewText={messaging.autoResponseGreeting(name)}
			footer={footer}
		>
			<Text style={eyebrow(colors)}>{messaging.autoResponseEyebrow}</Text>
			<Heading style={heading(colors)}>
				{messaging.autoResponseGreeting(name)}
			</Heading>
			<Text style={paragraph(colors)}>{messaging.autoResponseBody}</Text>

			<Hr style={divider} />

			<Section style={detailsBox(colors)}>
				<Text style={detailsBoxHeading}>Your Submission</Text>

				{gridPairs.map((pair, i) => (
					<Row key={`pair-${i}`}>
						{pair.map((field, j) => (
							<Column
								key={field.name}
								style={
									pair.length === 1
										? gridColumnFull
										: j === 0
											? gridColumnLeft
											: gridColumnRight
								}
							>
								<FieldRow
									field={field}
									value={formData[field.name]}
									colors={colors}
									compact
								/>
							</Column>
						))}
					</Row>
				))}

				{fullWidthFields.map((field) => (
					<FieldRow
						key={field.name}
						field={field}
						value={formData[field.name]}
						colors={colors}
						compact
					/>
				))}

				<FieldRow
					field={{ name: 'sentAt', label: 'Sent', type: 'text' }}
					value={timestamp}
					colors={colors}
					isLast
				/>
			</Section>

			<Text style={paragraph(colors)}>{messaging.autoResponseUrgentNote}</Text>

			<Section style={{ margin: '24px 0 0' }}>
				<Text style={{ ...paragraph(colors), margin: 0 }}>
					<strong>{messaging.signoffLabel}</strong>
					<br />
					<span
						dangerouslySetInnerHTML={{ __html: messaging.autoResponseClosing }}
					/>
				</Text>
			</Section>
		</EmailLayout>
	);
}

const eyebrow = (colors) => ({
	color: colors.accent,
	fontSize: '12px',
	fontWeight: 700,
	textTransform: 'uppercase',
	letterSpacing: '0.08em',
	margin: '0 0 8px',
});

const heading = (colors) => ({
	color: colors.text,
	margin: '0 0 16px',
	fontSize: '24px',
	fontWeight: 600,
	lineHeight: 1.3,
});

const paragraph = (colors) => ({
	color: colors.text,
	lineHeight: 1.6,
	fontSize: '15px',
	margin: '0 0 16px',
});

const divider = {
	borderColor: '#e5e7eb',
	margin: '24px 0',
};

const detailsBox = (colors) => ({
	backgroundColor: colors.surface,
	padding: '24px',
	margin: '0 0 24px',
	borderRadius: '8px',
	border: '1px solid #e5e7eb',
});

const detailsBoxHeading = {
	fontWeight: 600,
	color: '#6b7280',
	margin: '0 0 20px',
	fontSize: '13px',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
};

const gridColumnLeft = {
	width: '50%',
	paddingRight: '12px',
	verticalAlign: 'top',
};
const gridColumnRight = {
	width: '50%',
	paddingLeft: '12px',
	verticalAlign: 'top',
};
const gridColumnFull = { width: '100%', verticalAlign: 'top' };

const footerText = (colors) => ({
	margin: 0,
	color: colors.text,
	fontSize: '14px',
	lineHeight: 1.6,
});

const footerLink = (colors) => ({
	color: colors.accent,
	textDecoration: 'underline',
	fontWeight: 600,
});
