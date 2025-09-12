import {
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function VerificationCodeEmail({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) {
  const minutesRemaining = Math.floor((+expires - Date.now()) / (60 * 1000));
  
  return (
    <Html>
      <Tailwind>
        <Head />
        <Container className="container px-20 font-sans">
          <Heading className="mb-4 text-xl font-bold">
            Sign in to BuyBack Auctions
          </Heading>
          <Text className="text-sm">
            Please enter the following code on the sign in page.
          </Text>
          <Section className="text-center">
            <Text className="font-semibold">Verification code</Text>
            <Text className="text-4xl font-bold tracking-wider">{code}</Text>
            <Text className="text-sm text-gray-600">
              This code is valid for {minutesRemaining} minutes
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}