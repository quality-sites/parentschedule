// Define the Event interface
export interface Event {
  title: string;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  id: number;
  backgroundColor?: string;
  display?: string;
  textColor?: string;
}
