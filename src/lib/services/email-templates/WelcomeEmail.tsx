import { Logo } from "@/components/block/Logo";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto max-w-2xl p-4">
          <Section className="mb-6 text-center">
            <Logo />
          </Section>

          <Section className="mb-6">
            <Heading className="mb-4 text-2xl font-bold text-gray-900">
              Welcome to Closelead, {name}!
            </Heading>
            <Text className="mb-4 text-gray-700">
              I&apos;m Jit, the creator of Closelead. We&apos;re thrilled to
              have you join Closelead. Closelead is designed to help you
              organize your projects and tasks with ease.
            </Text>
            <Text className="mb-6 text-gray-700">
              To get started, create your first project and explore the features
              available. If you have any questions or need assistance, please
              don&apos;t hesitate to reach out.
            </Text>
          </Section>

          <Section className="text-center">
            <Button
              href="https://calendly.com/rely-prasanjit/30min"
              className="rounded-0 bg-blue-600 px-6 py-2 font-medium text-white"
            >
              Book a Call
            </Button>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WelcomeEmail;
