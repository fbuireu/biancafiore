import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

interface ContactNotificationEmailProps {
	name: string;
	email: string;
	message: string;
	date: string;
	mailTo: string;
}

const DARK_MODE_STYLE = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (prefers-color-scheme: dark) {
  .email-bg { background-color: #15130e !important; }
  .email-card { background-color: #1d1a13 !important; border-color: #332f22 !important; }
  .email-divider { border-color: #332f22 !important; }
  .email-heading { color: #ece6d8 !important; }
  .email-label { color: #ece6d8 !important; }
  .email-value { color: #cdc6b6 !important; }
  .email-muted { color: #968d7c !important; }
  .email-button { background-color: #cba968 !important; color: #15130e !important; }
}
[data-ogsc] .email-bg { background-color: #15130e !important; }
[data-ogsc] .email-card { background-color: #1d1a13 !important; border-color: #332f22 !important; }
[data-ogsc] .email-divider { border-color: #332f22 !important; }
[data-ogsc] .email-heading { color: #ece6d8 !important; }
[data-ogsc] .email-label { color: #ece6d8 !important; }
[data-ogsc] .email-value { color: #cdc6b6 !important; }
[data-ogsc] .email-muted { color: #968d7c !important; }
[data-ogsc] .email-button { background-color: #cba968 !important; color: #15130e !important; }
`;

const styles = {
	body: {
		backgroundColor: "#fafafa",
		fontFamily: "'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
		fontSize: "100%",
		lineHeight: 1.6,
		margin: 0,
		padding: "20px",
	},
	card: {
		backgroundColor: "#ffffff",
		border: "1px solid #eeeeee",
		borderRadius: "4px",
		margin: "0 auto",
		maxWidth: "600px",
		padding: "20px",
	},
	logo: {
		borderBottom: "1px solid #dddddd",
		fontSize: "40px",
		margin: "0 0 20px",
		paddingBottom: "20px",
		textAlign: "center" as const,
	},
	gold: {
		color: "#D4A259",
	},
	heading: {
		color: "#333333",
		fontSize: "36px",
		fontWeight: 200,
		margin: "0 0 30px",
		textAlign: "center" as const,
	},
	label: {
		color: "#333333",
		fontSize: "18px",
		fontWeight: 700,
		margin: "0 0 4px",
	},
	value: {
		color: "#333333",
		fontSize: "16px",
		margin: "0 0 20px",
		whiteSpace: "pre-wrap" as const,
	},
	divider: {
		borderTop: "1px solid #dddddd",
		margin: "20px 0",
	},
	reply: {
		color: "#666666",
		fontSize: "16px",
		margin: "0 0 16px",
	},
	button: {
		backgroundColor: "#1E2021",
		borderRadius: "4px",
		color: "#ffffff",
		display: "block",
		fontSize: "18px",
		padding: "16px",
		textAlign: "center" as const,
		textDecoration: "none",
		width: "100%",
	},
	footer: {
		borderTop: "1px solid #dddddd",
		color: "#666666",
		margin: "30px 0 0",
		paddingTop: "20px",
		textAlign: "center" as const,
	},
	signature: {
		color: "#666666",
		fontWeight: 700,
		margin: "16px 0 0",
		textAlign: "center" as const,
	},
};

export function ContactNotificationEmail({ name, email, message, date, mailTo }: ContactNotificationEmailProps) {
	return (
		<Html lang="en">
			<Head>
				<meta name="color-scheme" content="light dark" />
				<meta name="supported-color-schemes" content="light dark" />
				<style>{DARK_MODE_STYLE}</style>
			</Head>
			<Preview>New web contact form submission from {name}</Preview>
			<Body style={styles.body} className="email-bg">
				<Container style={styles.card} className="email-card">
					<Heading as="h2" style={styles.logo} className="email-heading">
						Bianca<span style={styles.gold}>F</span>iore
					</Heading>
					<Heading as="h1" style={styles.heading} className="email-heading">
						It's all about details innit?
					</Heading>
					<Section>
						<Text style={styles.label} className="email-label">
							Name:
						</Text>
						<Text style={styles.value} className="email-value">
							{name}
						</Text>
						<Text style={styles.label} className="email-label">
							Email:
						</Text>
						<Text style={styles.value} className="email-value">
							{email}
						</Text>
						<Text style={styles.label} className="email-label">
							Date:
						</Text>
						<Text style={styles.value} className="email-value">
							{date}
						</Text>
						<Text style={styles.label} className="email-label">
							Message:
						</Text>
						<Text style={styles.value} className="email-value">
							{message}
						</Text>
					</Section>
					<Hr style={styles.divider} className="email-divider" />
					<Text style={styles.reply} className="email-muted">
						Reply directly by clicking the following button:
					</Text>
					<Button href={mailTo} style={styles.button} className="email-button">
						Reply
					</Button>
					<Text style={styles.footer} className="email-muted">
						biancafiore.me
					</Text>
					<Text style={styles.signature} className="email-muted">
						Sent with 🖤 by Ciccino Pastino
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
