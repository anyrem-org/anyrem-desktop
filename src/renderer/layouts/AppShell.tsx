import { Outlet } from "react-router-dom";
import { ActivityPanel } from "../features/activity/components/ActivityPanel";
import { NoteDetailModal } from "../features/notes/components/NoteDetailModal";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <div className="flex min-h-0 flex-1">
          <main className="scrollbar min-w-0 flex-1 overflow-y-auto bg-[#f7f8fc]">
            <Outlet />
          </main>
          <ActivityPanel />
        </div>
      </div>
      <NoteDetailModal />
    </div>
  );
}
