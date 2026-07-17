import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header/Header';
import MainLayout from '../MainLayout/MainLayout';
import { StorageWarning } from '../StorageWarning/StorageWarning';

describe('Header', () => {
  const defaultProps = {
    completed: 3,
    total: 7,
    date: '2024-06-15',
  };

  it('renders app title "Bloomlist"', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Bloomlist' })).toBeInTheDocument();
  });

  it('displays progress "3 of 7 complete"', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('3 of 7 complete')).toBeInTheDocument();
  });

  it('formats date correctly from YYYY-MM-DD to "Month Day, Year"', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('June 15, 2024')).toBeInTheDocument();
  });
});

describe('MainLayout', () => {
  it('renders both task and garden panels', () => {
    render(
      <MainLayout
        taskPanel={<div data-testid="task-panel">Tasks</div>}
        gardenPanel={<div data-testid="garden-panel">Garden</div>}
      />
    );

    expect(screen.getByTestId('task-panel')).toBeInTheDocument();
    expect(screen.getByTestId('garden-panel')).toBeInTheDocument();
  });

  it('has layout container class', () => {
    const { container } = render(
      <MainLayout
        taskPanel={<div>Tasks</div>}
        gardenPanel={<div>Garden</div>}
      />
    );

    const layoutEl = container.firstElementChild;
    expect(layoutEl).toHaveClass(/layout/);
  });
});

describe('StorageWarning', () => {
  it('renders alert with correct message when visible=true', () => {
    render(<StorageWarning visible={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByText('Warning: Your progress may not be saved. Local storage is unavailable.')
    ).toBeInTheDocument();
  });

  it('does not render when visible=false', () => {
    const { container } = render(<StorageWarning visible={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});
