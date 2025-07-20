
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Appointment } from '@/types';

export const CalendarScheduler = () => {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime || !patientName.trim()) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      patientName: patientName.trim(),
      status: 'scheduled',
      notes: ''
    };

    setAppointments((prev: Appointment[]) => [...prev, newAppointment]);
    setPatientName('');
    setSelectedTime('');
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      new Date(apt.date).toDateString() === date.toDateString()
    );
  };

  const isTimeSlotTaken = (time: string) => {
    if (!selectedDate) return false;
    return appointments.some(apt => 
      new Date(apt.date).toDateString() === selectedDate.toDateString() && 
      apt.time === time
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Agendar Consulta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            
            {selectedDate && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome do Paciente
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o nome do paciente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Horário Disponível
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(time => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        disabled={isTimeSlotTaken(time)}
                        onClick={() => setSelectedTime(time)}
                        className="text-sm"
                      >
                        {time}
                        {isTimeSlotTaken(time) && ' (Ocupado)'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleScheduleAppointment}
                  disabled={!selectedTime || !patientName.trim()}
                  className="w-full"
                >
                  Agendar Consulta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Consultas Agendadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div>
                <h3 className="font-medium mb-3">
                  {selectedDate.toLocaleDateString('pt-BR')}
                </h3>
                <div className="space-y-2">
                  {getAppointmentsForDate(selectedDate).map(appointment => (
                    <div
                      key={appointment.id}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.time}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'scheduled' 
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'scheduled' ? 'Agendada' :
                           appointment.status === 'completed' ? 'Concluída' : 'Cancelada'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {getAppointmentsForDate(selectedDate).length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma consulta agendada para este dia
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
