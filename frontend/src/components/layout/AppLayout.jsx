import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopNav />
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
