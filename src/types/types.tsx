type filling = {
  name: string;
  tastes: {
    flavor: string;
    amount: number;
  }[];
  powers: {
    type: string;
    amount: number;
  }[];
  types: {
    type: string;
    amount: number;
  }[];
  imageUrl: string;
  pieces: number;
};

type condiment = {
  name: string;
  tastes: {
    flavor: string;
    amount: number;
  }[];
  powers: {
    type: string;
    amount: number;
  }[];
  types: {
    type: string;
    amount: number;
  }[];
  imageUrl: string;
};

type power = {
  type: string;
  amount: number;
  modded?: boolean;
  boosted?: boolean;
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
  dropped: number;
  overflow: boolean;
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

type typeOfPower =
  | 'Egg Power'
  | 'Catching Power'
  | 'Exp. Point Power'
  | 'Item Drop Power'
  | 'Raid Power'
  | 'Sparkling Power'
  | 'Title Power'
  | 'Humungo Power'
  | 'Teensy Power'
  | 'Encounter Power';

type typesOfPokemon =
  | 'Normal'
  | 'Fighting'
  | 'Flying'
  | 'Poison'
  | 'Ground'
  | 'Rock'
  | 'Bug'
  | 'Ghost'
  | 'Steel'
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Psychic'
  | 'Ice'
  | 'Dragon'
  | 'Dark'
  | 'Fairy'
  | '';

type typesOfFlavors = 'Sweet' | 'Salty' | 'Sour' | 'Bitter' | 'Hot';
