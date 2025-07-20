
export interface Appointment {
  id: string;
  date: Date;
  time: string;
  patientName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export interface PsychologistProfile {
  name: string;
  specialty: string;
  experience: string;
  approach: string;
  bio: string;
  guidelines: string;
  personaStyle: string;
  documentation: string;
}

export interface ConsultationProtocol {
  id: string;
  patientName: string;
  sessionNumber: number;
  date: Date;
  objectives: string[];
  activities: string[];
  progress: number;
  gamificationScore: number;
  nextSteps: string[];
  status: 'planning' | 'active' | 'completed';
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'psychologist';
  timestamp: Date;
}
