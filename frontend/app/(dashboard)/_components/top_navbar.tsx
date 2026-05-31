"use client";

import NotificationDropdown from "./notification_dropdown";

export default function TopNavbar() {
    return (
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-100 sticky top-0 z-40">
            {/* Left side — page title slot (optional, can pass via props or context) */}
            <div className="flex items-center gap-2">
                {/* Placeholder — replace with a <PageTitle /> context consumer if needed */}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Notification bell with dropdown */}
                <NotificationDropdown />
            </div>
        </header>
    );
}