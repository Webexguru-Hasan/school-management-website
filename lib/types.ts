export type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  status: string;
  // Add other fields as needed
};

export type Teacher = {
  id: string;
  full_name: string;
  status: string;
};

export type Class = {
  id: string;
  name: string;
  section: string;
};
