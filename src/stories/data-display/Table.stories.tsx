import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableFooter,
} from '../../components/ui/table';

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV002</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell>PayPal</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV003</TableCell>
          <TableCell>Unpaid</TableCell>
          <TableCell>Bank Transfer</TableCell>
          <TableCell className="text-right">$350.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV004</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$450.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV005</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>PayPal</TableCell>
          <TableCell className="text-right">$550.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV006</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell>Bank Transfer</TableCell>
          <TableCell className="text-right">$200.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV007</TableCell>
          <TableCell>Unpaid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$300.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Simple: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Bob Johnson</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Design new homepage</TableCell>
          <TableCell>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Completed</span>
          </TableCell>
          <TableCell>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">High</span>
          </TableCell>
          <TableCell>2024-01-15</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Implement user auth</TableCell>
          <TableCell>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">In Progress</span>
          </TableCell>
          <TableCell>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Medium</span>
          </TableCell>
          <TableCell>2024-01-20</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Write documentation</TableCell>
          <TableCell>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Not Started</span>
          </TableCell>
          <TableCell>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Low</span>
          </TableCell>
          <TableCell>2024-01-25</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const ProductTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Wireless Headphones</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$99.99</TableCell>
          <TableCell>25</TableCell>
          <TableCell>
            <button className="text-blue-600 hover:underline mr-2">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Coffee Mug</TableCell>
          <TableCell>Kitchen</TableCell>
          <TableCell>$12.99</TableCell>
          <TableCell>50</TableCell>
          <TableCell>
            <button className="text-blue-600 hover:underline mr-2">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Laptop Stand</TableCell>
          <TableCell>Office</TableCell>
          <TableCell>$45.00</TableCell>
          <TableCell>0</TableCell>
          <TableCell>
            <button className="text-blue-600 hover:underline mr-2">Edit</button>
            <button className="text-red-600 hover:underline">Delete</button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Loading: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
