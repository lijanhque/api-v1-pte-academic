import { notFound } from 'next/navigation';
import { generateMockTestData, MockTest } from '@/lib/pte/mock-test-data';
import MockTestSimulator from '@/components/pte/mock-test-simulator';

interface MockTestPageProps {
  params: {
    id: string;
  };
}

export default function MockTestPage({ params }: MockTestPageProps) {
  const { id } = params;
  
  // Find the mock test by ID
  const mockTests = generateMockTestData();
  const mockTest = mockTests.find(test => test.id === id);
  
  if (!mockTest) {
    notFound();
  }

  return <MockTestSimulator mockTest={mockTest} />;
}