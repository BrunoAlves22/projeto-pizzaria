export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
