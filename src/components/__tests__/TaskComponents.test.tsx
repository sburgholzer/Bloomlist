import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskInput } from '../TaskInput/TaskInput';
import { TaskItem } from '../TaskItem/TaskItem';
import { TaskList } from '../TaskList/TaskList';
import type { Task } from '../../types';

describe('TaskInput', () => {
  const defaultProps = {
    onAddTask: vi.fn(),
    taskCount: 0,
    maxTasks: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a valid title and clears the input', () => {
    render(<TaskInput {...defaultProps} />);

    const input = screen.getByLabelText('Task title');
    const button = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'Buy groceries' } });
    fireEvent.click(button);

    expect(defaultProps.onAddTask).toHaveBeenCalledWith('Buy groceries');
    expect(input).toHaveValue('');
  });

  it('rejects empty submission and shows error message', () => {
    render(<TaskInput {...defaultProps} />);

    const button = screen.getByRole('button', { name: /add/i });
    fireEvent.click(button);

    expect(screen.getByText('Please enter a task title.')).toBeInTheDocument();
    expect(defaultProps.onAddTask).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only submission', () => {
    render(<TaskInput {...defaultProps} />);

    const input = screen.getByLabelText('Task title');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByText('Please enter a task title.')).toBeInTheDocument();
    expect(defaultProps.onAddTask).not.toHaveBeenCalled();
  });

  it('shows limit message and disables input when at max tasks', () => {
    render(<TaskInput {...defaultProps} taskCount={20} />);

    expect(screen.getByText('Daily task limit of 20 reached.')).toBeInTheDocument();
    expect(screen.getByLabelText('Task title')).toBeDisabled();
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('clears error when user types after an error', () => {
    render(<TaskInput {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText('Please enter a task title.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'a' } });
    expect(screen.queryByText('Please enter a task title.')).not.toBeInTheDocument();
  });
});

describe('TaskItem', () => {
  const incompleteTask: Task = {
    id: 'task-1',
    title: 'Water the plants',
    completed: false,
    createdAt: 1000,
  };

  const completedTask: Task = {
    id: 'task-2',
    title: 'Read a book',
    completed: true,
    createdAt: 2000,
  };

  const defaultProps = {
    task: incompleteTask,
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title and toggle with unchecked state', () => {
    render(<TaskItem {...defaultProps} />);

    expect(screen.getByText('Water the plants')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('renders completed task with checked state', () => {
    render(<TaskItem {...defaultProps} task={completedTask} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggle when toggle button is clicked', () => {
    render(<TaskItem {...defaultProps} />);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(defaultProps.onToggle).toHaveBeenCalledWith('task-1');
  });

  it('calls onDelete after window.confirm returns true', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<TaskItem {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Delete "Water the plants"'));
    expect(window.confirm).toHaveBeenCalled();
    expect(defaultProps.onDelete).toHaveBeenCalledWith('task-1');
  });

  it('does not call onDelete when window.confirm returns false', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TaskItem {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Delete "Water the plants"'));
    expect(window.confirm).toHaveBeenCalled();
    expect(defaultProps.onDelete).not.toHaveBeenCalled();
  });

  it('applies strikethrough style to completed task title', () => {
    const { container } = render(<TaskItem {...defaultProps} task={completedTask} />);

    const titleEl = container.querySelector('[class*="titleCompleted"]');
    expect(titleEl).toBeInTheDocument();
  });
});

describe('TaskList', () => {
  const tasks: Task[] = [
    { id: '1', title: 'First task', completed: false, createdAt: 1000 },
    { id: '2', title: 'Second task', completed: true, createdAt: 2000 },
    { id: '3', title: 'Third task', completed: false, createdAt: 3000 },
  ];

  const defaultProps = {
    tasks,
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state message when there are no tasks', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
  });

  it('renders all tasks in order', () => {
    render(<TaskList {...defaultProps} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
    expect(screen.getByText('Third task')).toBeInTheDocument();
  });

  it('renders a list element when tasks exist', () => {
    render(<TaskList {...defaultProps} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('does not render a list element when there are no tasks', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
