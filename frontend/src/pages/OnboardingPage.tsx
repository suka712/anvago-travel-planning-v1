import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<any>({});

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Anvago</h1>
          <p className="text-xl text-gray-600">Plan your perfect trip to Danang</p>
        </div>

        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Anvago!</h2>
            <p className="text-gray-600 mb-6">
              Let's create a personalized itinerary just for you
            </p>
            <Button onClick={() => setStep(2)} size="large">
              Get Started
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

