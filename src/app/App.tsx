import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DocumentTypeSelector, DocumentType } from './components/DocumentTypeSelector';
import { LegalFactsForm } from './components/LegalFactsForm';
import { LegalEditor } from './components/LegalEditor';
import { DocumentHistory, DocumentHistoryItem } from './components/DocumentHistory';
import { VersionControl, DocumentVersion } from './components/VersionControl';
import { History, X, ArrowLeft } from 'lucide-react';

import { generateDraft } from './utils/ai';

interface CurrentDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  facts: string;
  versions: DocumentVersion[];
}

export default function App() {
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<CurrentDocument | undefined>();
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryItem[]>([]);

  // Initial Load from LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vakeel_saab_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const formatted = parsed.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          lastModified: new Date(doc.lastModified)
        }));
        setDocumentHistory(formatted);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Sync History to LocalStorage
  useEffect(() => {
    localStorage.setItem('vakeel_saab_history', JSON.stringify(documentHistory));
  }, [documentHistory]);

  const handleGenerateDraft = async (facts: string, selectedType: DocumentType) => {
    setIsGenerating(true);

    try {
      const content = await generateDraft(selectedType, facts);
      const now = new Date();
      const title = `${getDocumentTypeTitle(selectedType)} - ${now.toLocaleDateString('en-IN')}`;
      const newId = `doc-${Date.now()}`;

      const newDocument: CurrentDocument = {
        id: newId,
        type: selectedType,
        title,
        content,
        facts,
        versions: [
          {
            id: `version-${Date.now()}`,
            timestamp: now,
            label: 'Initial Draft',
            contentPreview: stripHTML(content).substring(0, 200),
          },
        ],
      };

      setCurrentDocument(newDocument);
      localStorage.setItem(`doc-${newId}`, JSON.stringify(newDocument));

      // Add to history
      const historyItem: DocumentHistoryItem = {
        id: newId,
        title,
        type: selectedType,
        createdAt: now,
        lastModified: now,
        preview: stripHTML(content).substring(0, 150),
      };

      setDocumentHistory((prev) => [historyItem, ...prev]);
      navigate(`/editor/${newId}`);
    } catch (error) {
      console.error('Error generating draft:', error);
      alert('Failed to generate document. Please make sure your VITE_GROQ_API_KEY is set in .env.local and restart the server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!currentDocument) return;

    const now = new Date();

    const newVersion: DocumentVersion = {
      id: `version-${Date.now()}`,
      timestamp: now,
      label: `Edit ${currentDocument.versions.length}`,
      contentPreview: stripHTML(newContent).substring(0, 200),
    };

    const updatedDocument = { 
      ...currentDocument, 
      content: newContent, 
      versions: [newVersion, ...currentDocument.versions] 
    };

    setCurrentDocument(updatedDocument);
    localStorage.setItem(`doc-${currentDocument.id}`, JSON.stringify(updatedDocument));

    setDocumentHistory((prev) =>
      prev.map((doc) =>
        doc.id === currentDocument.id
          ? { ...doc, lastModified: now, preview: stripHTML(newContent).substring(0, 150) }
          : doc
      )
    );
  };

  const handleRestoreVersion = (version: DocumentVersion) => {
    if (!currentDocument) return;
    if (confirm('Restore this version? Current changes will be saved as a new version.')) {
      handleContentChange(version.contentPreview); // This will save current as a version and update content
      setShowVersions(false);
    }
  };

  const handleDuplicateDocument = (docId: string) => {
    const docData = localStorage.getItem(`doc-${docId}`);
    if (!docData) return;

    try {
      const original = JSON.parse(docData);
      const now = new Date();
      const newId = `doc-${Date.now()}`;
      
      const newDoc = {
        ...original,
        id: newId,
        title: `${original.title} (Copy)`,
        createdAt: now.toISOString(),
        versions: [{
          id: `v-init-${Date.now()}`,
          timestamp: now.toISOString(),
          label: 'Duplicated Version',
          contentPreview: original.content
        }]
      };

      localStorage.setItem(`doc-${newId}`, JSON.stringify(newDoc));

      const historyItem: DocumentHistoryItem = {
        id: newId,
        title: newDoc.title,
        type: newDoc.type,
        createdAt: now,
        lastModified: now,
        preview: stripHTML(newDoc.content).substring(0, 150),
      };

      setDocumentHistory((prev) => [historyItem, ...prev]);
      alert('Document duplicated successfully!');
    } catch (e) {
      console.error("Duplication failed", e);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocumentHistory((prev) => prev.filter((doc) => doc.id !== docId));
      localStorage.removeItem(`doc-${docId}`);

      if (currentDocument?.id === docId) {
        setCurrentDocument(undefined);
        navigate('/workspace');
      }
    }
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/workspace')} />} />

        <Route path="/workspace" element={
          <WorkspaceWrapper 
            documentHistory={documentHistory}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            handleDeleteDocument={handleDeleteDocument}
            handleDuplicateDocument={handleDuplicateDocument}
            setCurrentDocument={setCurrentDocument}
          />
        } />

        {/* Draft Form Route */}
        <Route path="/draft/:type" element={
          <DraftRouteWrapper 
            isGenerating={isGenerating}
            onGenerate={handleGenerateDraft}
            onBack={() => navigate('/workspace')}
          />
        } />

        {/* Editor Route */}
        <Route path="/editor/:id" element={
          <div className="flex h-full w-full overflow-hidden">
            <EditorRouteWrapper 
              currentDocument={currentDocument}
              setCurrentDocument={setCurrentDocument}
              onContentChange={handleContentChange}
              onRestore={handleRestoreVersion}
              onExport={handleExport}
              onShowHistory={() => setShowHistory(!showHistory)}
              onShowVersions={() => setShowVersions(true)}
              onBack={() => navigate('/workspace')}
            />

            {showHistory && (
              <div className="fixed inset-0 z-50 md:relative md:inset-auto md:w-96 flex-shrink-0 border-l border-[var(--grey-300)] animate-in slide-in-from-right duration-300">
                <DocumentHistory
                  documents={documentHistory}
                  onOpen={(id) => {
                    navigate(`/editor/${id}`);
                    if (window.innerWidth < 768) setShowHistory(false);
                  }}
                  onDuplicate={handleDuplicateDocument}
                  onDelete={handleDeleteDocument}
                  onClose={() => setShowHistory(false)}
                />
              </div>
            )}
          </div>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showVersions && currentDocument && (
        <VersionControl
          versions={currentDocument.versions}
          currentVersionId={currentDocument.versions[0]?.id}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// Wrapper Components for Routes
// ---------------------------------------------------------

function WorkspaceWrapper({ 
  documentHistory, 
  showHistory, 
  setShowHistory, 
  handleDeleteDocument,
  handleDuplicateDocument,
  setCurrentDocument
}: any) {
  const navigate = useNavigate();
  
  useEffect(() => {
    setCurrentDocument(undefined);
  }, [setCurrentDocument]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-[var(--grey-600)] hover:text-[var(--matte-black)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
          <DocumentTypeSelector 
            onSelect={(type) => navigate(`/draft/${type}`)} 
          />
        </div>
      </div>
      
      {!showHistory && (
        <button
          onClick={() => setShowHistory(true)}
          className="fixed bottom-6 right-6 md:top-6 md:bottom-auto p-3 bg-[var(--matte-black)] text-[var(--pure-white)] hover:bg-[var(--grey-900)] transition-colors z-10 border border-[var(--matte-black)] shadow-lg"
          title="Document History"
        >
          <History className="w-5 h-5" />
        </button>
      )}
      
      {showHistory && (
        <div className="fixed inset-0 z-50 md:relative md:inset-auto md:w-96 flex-shrink-0 border-l border-[var(--grey-300)] animate-in slide-in-from-right duration-300">
          <DocumentHistory
            documents={documentHistory}
            onOpen={(id) => {
              navigate(`/editor/${id}`);
              if (window.innerWidth < 768) setShowHistory(false);
            }}
            onDuplicate={handleDuplicateDocument}
            onDelete={handleDeleteDocument}
            onClose={() => setShowHistory(false)}
          />
        </div>
      )}
    </div>
  );
}

function DraftRouteWrapper({ onGenerate, onBack, isGenerating }: any) {
  const { type } = useParams<{ type: string }>();
  if (!type) return <Navigate to="/workspace" />;

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <LegalFactsForm
          documentType={type as DocumentType}
          onGenerate={(facts) => onGenerate(facts, type as DocumentType)}
          onBack={onBack}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}

function EditorRouteWrapper({ 
  currentDocument, 
  setCurrentDocument, 
  onContentChange, 
  onRestore,
  onExport,
  onShowHistory, 
  onShowVersions, 
  onBack 
}: any) {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && (!currentDocument || currentDocument.id !== id)) {
      const docData = localStorage.getItem(`doc-${id}`);
      if (docData) {
        try {
          const parsed = JSON.parse(docData);
          setCurrentDocument({
            ...parsed,
            versions: (parsed.versions || []).map((v: any) => ({ ...v, timestamp: new Date(v.timestamp) }))
          });
        } catch (e) {
          console.error("Failed to load document", e);
        }
      }
    }
  }, [id, currentDocument, setCurrentDocument]);

  if (!currentDocument || currentDocument.id !== id) {
    return <div className="flex-1 flex items-center justify-center h-full">Loading document...</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <LegalEditor
        initialContent={currentDocument.content}
        onContentChange={onContentChange}
        onRestore={onRestore}
        onExport={onExport}
        onShowHistory={onShowHistory}
        onShowVersions={onShowVersions}
        onBack={onBack}
      />
    </div>
  );
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

function getDocumentTypeTitle(type: DocumentType): string {
  const titles: Record<DocumentType, string> = {
    'fir-complaint': 'FIR Complaint',
    'bail-petition': 'Bail Petition',
    'affidavit': 'Affidavit',
    'legal-notice': 'Legal Notice',
    'writ-petition': 'Writ Petition',
    'criminal-complaint': 'Criminal Complaint',
    'civil-pleading': 'Civil Pleading',
    'counter-affidavit': 'Counter Affidavit',
    'written-statement': 'Written Statement',
    'general-legal-advice': 'General Legal Advice'
  };
  return titles[type] || 'Legal Document';
}

function stripHTML(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
