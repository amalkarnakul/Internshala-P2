import ReactDOM from 'react-dom/client';
import { HierarchicalCombobox } from './components/HierarchicalCombobox.js';
import { TreeDataLoader } from './types/tree';
import './styles/globals.css';

// Demo data loader
const demoLoader: TreeDataLoader = {
  loadChildren: async (nodeId: string | null) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (nodeId === null) {
      return [
        {
          id: '1',
          label: 'Documents',
          value: { type: 'folder', name: 'Documents' },
          level: 0,
          hasChildren: true,
          path: ['1'],
        },
        {
          id: '2',
          label: 'Images',
          value: { type: 'folder', name: 'Images' },
          level: 0,
          hasChildren: true,
          path: ['2'],
        },
        {
          id: '3',
          label: 'Videos',
          value: { type: 'folder', name: 'Videos' },
          level: 0,
          hasChildren: false,
          path: ['3'],
        },
      ];
    }
    
    if (nodeId === '1') {
      return [
        {
          id: '1-1',
          label: 'Work Documents',
          value: { type: 'folder', name: 'Work Documents' },
          level: 1,
          hasChildren: true,
          parentId: '1',
          path: ['1', '1-1'],
        },
        {
          id: '1-2',
          label: 'Personal Documents',
          value: { type: 'folder', name: 'Personal Documents' },
          level: 1,
          hasChildren: false,
          parentId: '1',
          path: ['1', '1-2'],
        },
      ];
    }
    
    if (nodeId === '1-1') {
      return [
        {
          id: '1-1-1',
          label: 'Reports.pdf',
          value: { type: 'file', name: 'Reports.pdf' },
          level: 2,
          hasChildren: false,
          parentId: '1-1',
          path: ['1', '1-1', '1-1-1'],
        },
        {
          id: '1-1-2',
          label: 'Presentation.pptx',
          value: { type: 'file', name: 'Presentation.pptx' },
          level: 2,
          hasChildren: false,
          parentId: '1-1',
          path: ['1', '1-1', '1-1-2'],
        },
      ];
    }
    
    if (nodeId === '2') {
      return [
        {
          id: '2-1',
          label: 'Photos',
          value: { type: 'folder', name: 'Photos' },
          level: 1,
          hasChildren: false,
          parentId: '2',
          path: ['2', '2-1'],
        },
        {
          id: '2-2',
          label: 'Screenshots',
          value: { type: 'folder', name: 'Screenshots' },
          level: 1,
          hasChildren: false,
          parentId: '2',
          path: ['2', '2-2'],
        },
      ];
    }
    
    return [];
  },
  searchNodes: async (searchTerm: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allNodes = [
      { id: '1', label: 'Documents', value: {}, level: 0, path: ['1'] },
      { id: '1-1', label: 'Work Documents', value: {}, level: 1, parentId: '1', path: ['1', '1-1'] },
      { id: '1-1-1', label: 'Reports.pdf', value: {}, level: 2, parentId: '1-1', path: ['1', '1-1', '1-1-1'] },
      { id: '2', label: 'Images', value: {}, level: 0, path: ['2'] },
      { id: '2-1', label: 'Photos', value: {}, level: 1, parentId: '2', path: ['2', '2-1'] },
    ];
    
    return allNodes.filter(node =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Hierarchical Combobox Demo
          </h1>
          <p className="text-neutral-600">
            A scalable hierarchical selection component with async loading, virtualization, and multi-select.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-3">Single Select</h2>
            <HierarchicalCombobox
              loader={demoLoader}
              placeholder="Search files and folders..."
              aria-label="File browser"
              onSelectionChange={(ids, nodes) => {
                console.log('Single select:', { ids, nodes });
              }}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-3">Multi Select</h2>
            <HierarchicalCombobox
              loader={demoLoader}
              placeholder="Select multiple items..."
              isMultiSelect={true}
              aria-label="Multi-select file browser"
              onSelectionChange={(ids, nodes) => {
                console.log('Multi select:', { ids, nodes });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);