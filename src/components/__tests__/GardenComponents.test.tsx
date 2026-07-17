import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Plant } from '../Plant/Plant';
import { GardenPanel } from '../GardenPanel/GardenPanel';
import { CelebrationOverlay } from '../CelebrationOverlay/CelebrationOverlay';
import type { Task } from '../../types';

describe('Plant', () => {
  const defaultProps = {
    growthStage: 'seed' as const,
    isAnimating: false,
    onAnimationComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with correct aria-label for seed stage', () => {
    render(<Plant {...defaultProps} growthStage="seed" />);

    expect(screen.getByLabelText('Plant stage: seed')).toBeInTheDocument();
  });

  it('renders with correct aria-label for blooming stage', () => {
    render(<Plant {...defaultProps} growthStage="blooming" />);

    expect(screen.getByLabelText('Plant stage: blooming')).toBeInTheDocument();
  });

  it('applies animating class when isAnimating is true', () => {
    const { container } = render(<Plant {...defaultProps} isAnimating={true} />);

    const plantEl = container.querySelector('[class*="animating"]');
    expect(plantEl).toBeInTheDocument();
  });

  it('does not apply animating class when isAnimating is false', () => {
    const { container } = render(<Plant {...defaultProps} isAnimating={false} />);

    const plantEl = container.querySelector('[class*="animating"]');
    expect(plantEl).not.toBeInTheDocument();
  });

  it('starts animation sequence when isAnimating becomes true', () => {
    render(<Plant {...defaultProps} isAnimating={true} />);

    // Initially starts at seed stage
    expect(screen.getByLabelText('Plant stage: seed')).toBeInTheDocument();

    // Advance through first stage (375ms per stage)
    act(() => {
      vi.advanceTimersByTime(375);
    });

    expect(screen.getByLabelText('Plant stage: sprout')).toBeInTheDocument();
  });
});

describe('GardenPanel', () => {
  const defaultProps = {
    tasks: [] as Task[],
    allComplete: false,
  };

  it('shows empty garden message when there are no tasks', () => {
    render(<GardenPanel {...defaultProps} />);

    expect(
      screen.getByText('Your garden is empty. Add tasks to plant seeds!')
    ).toBeInTheDocument();
  });

  it('renders a section with Garden aria-label', () => {
    render(<GardenPanel {...defaultProps} />);

    expect(screen.getByRole('region', { name: 'Garden' })).toBeInTheDocument();
  });

  it('renders correct number of plant elements for given tasks', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: 1000 },
      { id: '2', title: 'Task 2', completed: true, createdAt: 2000 },
      { id: '3', title: 'Task 3', completed: false, createdAt: 3000 },
    ];

    render(<GardenPanel tasks={tasks} allComplete={false} />);

    const plants = screen.getAllByLabelText(/Plant stage:/);
    expect(plants).toHaveLength(3);
  });

  it('renders plants with correct growth stages based on task completion', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Incomplete', completed: false, createdAt: 1000 },
      { id: '2', title: 'Complete', completed: true, createdAt: 2000 },
    ];

    render(<GardenPanel tasks={tasks} allComplete={false} />);

    expect(screen.getByLabelText('Plant stage: seed')).toBeInTheDocument();
    expect(screen.getByLabelText('Plant stage: blooming')).toBeInTheDocument();
  });

  it('does not show empty message when tasks exist', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: 1000 },
    ];

    render(<GardenPanel tasks={tasks} allComplete={false} />);

    expect(
      screen.queryByText('Your garden is empty. Add tasks to plant seeds!')
    ).not.toBeInTheDocument();
  });
});

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders overlay with particles when active is true', () => {
    const { container } = render(<CelebrationOverlay active={true} />);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });

  it('does not render when active is false', () => {
    const { container } = render(<CelebrationOverlay active={false} />);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeInTheDocument();
  });

  it('auto-hides after 3000ms', () => {
    const { container } = render(<CelebrationOverlay active={true} />);

    // Initially visible
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    // After 3000ms, should hide
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it('hides immediately when active changes to false', () => {
    const { container, rerender } = render(<CelebrationOverlay active={true} />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    rerender(<CelebrationOverlay active={false} />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});
