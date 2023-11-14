import { Stack } from 'expo-router';
export default function ReportingLayout() {
  return (
    <Stack>
      <Stack.Screen name="meals" options={{ headerShown: false }} />
      {/* <Stack.Screen name="leaderboard" options={{ headerShown: false }} /> */}
    </Stack>
  );
} 