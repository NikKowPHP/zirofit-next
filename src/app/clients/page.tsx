import Link from 'next/link';
import { getTrainerClients } from './actions';
import { Button } from '../../components/ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import DeleteClientButton from '@/components/clients/DeleteClientButton';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

export default async function ClientListPage() {
  const clients = await getTrainerClients();

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Client Management</h2>
        <Link href="/clients/create">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Bulk Actions Toolbar */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg shadow-sm hidden" id="bulkActionsToolbar">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span id="selectedCount">0</span> clients selected
          </div>
          <div className="space-x-2">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              id="bulkDeleteButton"
              disabled
            >
              Delete Selected
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              id="bulkExportButton"
              disabled
            >
              Export Selected
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.length > 0 ? (
              clients.map((client: Client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' :
                      client.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Links will be implemented next */}
                    <Link href={`/clients/${client.id}`} className="text-gray-600 hover:text-indigo-600">View</Link>
                    <Link href={`/clients/${client.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                    <DeleteClientButton clientId={client.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
