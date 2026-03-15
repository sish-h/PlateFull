# PlateFull
A children's nutrition app built with TypeScript to help kids develop healthy eating habits.

## What it does
PlateFull provides a fun and interactive way for kids to learn about nutrition and track their daily food intake. The app includes a database of healthy foods, a meal planner, and a rewards system to encourage kids to make nutritious choices.

## Getting Started
To install and run PlateFull, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/PlateFull.git`
2. Install dependencies: `npm install`
3. Start the app: `npm start`

## Example Use Case
Create a new user and add a food item to their plate:
```typescript
import { User, Food } from './models';

const user = new User('John Doe');
const apple = new Food('Apple', 'Fruit', 95);

user.addFood(apple);
console.log(user.getPlate());
```
This will output the user's plate with the added food item.

## Contribution
Contributions are welcome! If you have any ideas or bug fixes, feel free to open an issue or submit a pull request.