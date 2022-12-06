type filling = {
  imageUrl: string;
  name: string;
  pieces: number;
  powers: { type: string; amount: number }[];
  tastes: { type: string; amount: number }[];
  types: { type: string; amount: number }[];
};

type condiment = {
  imageUrl: string;
  name: string;
  pieces: number;
  powers: { type: string; amount: number }[];
  tastes: { type: string; amount: number }[];
  types: { type: string; amount: number }[];
};

type power = {
  type: string;
  amount: number;
  modded?: boolean;
};

type taste = {
  flavor: string;
  amount: number;
};

type type = {
  type: string;
  amount: number;
};

type summation = {
  tastes: taste[];
  powers: power[];
  types: type[];
};

type presetSandwich = {
  number: string; // It is a # but it is formatted as a string
  name: string;
  description: string;
  fillings: string[];
  condiments: string[];
  effects: { name: string; type: string; level: string }[];
  imageUrl: string;
  location: string;
};
