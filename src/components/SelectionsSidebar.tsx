interface SelectionItem {
  icon: string;
  label: string;
  value: string | null;
}

interface SelectionsSidebarProps {
  items: SelectionItem[];
}

export function SelectionsSidebar({ items }: SelectionsSidebarProps) {
  return (
    <aside className="selections-sidebar">
      <span className="sidebar-title">Your Choices</span>
      {items.map((item) => (
        <div
          key={item.label}
          className={`sidebar-item ${item.value ? "has-value" : ""}`}
        >
          <span className="sidebar-item-icon">{item.icon}</span>
          <div className="sidebar-item-content">
            <span className="sidebar-item-label">{item.label}</span>
            <span
              className={`sidebar-item-value ${!item.value ? "empty" : ""}`}
            >
              {item.value ?? "—"}
            </span>
          </div>
        </div>
      ))}
    </aside>
  );
}
