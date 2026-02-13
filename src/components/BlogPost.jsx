import { useState } from 'react';
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';

const BlogPost = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const typeConfig = {
    progress: { 
      icon: Clock, 
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50', 
      border: 'border-blue-200',
      text: 'text-blue-600', 
      label: 'İlerleme Günlüğü' 
    },
    completion: { 
      icon: CheckCircle, 
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200',
      text: 'text-emerald-600', 
      label: 'Tamamlama Raporu' 
    },
    error: { 
      icon: AlertCircle, 
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50', 
      border: 'border-red-200',
      text: 'text-red-600', 
      label: 'Hata Raporu' 
    },
    note: { 
      icon: FileText, 
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50', 
      border: 'border-violet-200',
      text: 'text-violet-600', 
      label: 'Not' 
    },
  };

  const type = typeConfig[log.type] || typeConfig.note;
  const TypeIcon = type.icon;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-slate-800 font-semibold text-sm mt-4 mb-2">{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-slate-800 font-semibold text-base mt-5 mb-2">{line.slice(3)}</h3>;
      }
      
      // List items
      if (line.startsWith('- ')) {
        const text = line.slice(2);
        // Check for strikethrough
        if (text.startsWith('~~') && text.endsWith('~~')) {
          return (
            <li key={index} className="text-slate-400 text-sm ml-4 line-through">
              {text.slice(2, -2).split(' - ')[0]}
              {text.includes(' - ') && <span className="text-red-500 ml-2">{text.split(' - ')[1]?.replace('~~', '')}</span>}
            </li>
          );
        }
        return (
          <li key={index} className="text-slate-600 text-sm ml-4 list-disc leading-relaxed">
            {renderInlineMarkdown(text)}
          </li>
        );
      }

      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '');
        if (text.startsWith('~~') && text.endsWith('~~')) {
          return (
            <li key={index} className="text-slate-400 text-sm ml-4 line-through list-decimal">
              {text.slice(2, -2).split(' - ')[0]}
            </li>
          );
        }
        return (
          <li key={index} className="text-slate-600 text-sm ml-4 list-decimal leading-relaxed">
            {renderInlineMarkdown(text)}
          </li>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Regular paragraph
      return (
        <p key={index} className="text-slate-600 text-sm leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text) => {
    // Handle bold (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*|\`[^`]+\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-800 font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden card-hover">
      {/* Header */}
      <div 
        className={`${type.bg} px-5 py-4 flex items-center justify-between cursor-pointer border-b ${type.border}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center
                        shadow-lg`}>
            <TypeIcon size={20} className="text-white" />
          </div>
          <div>
            <span className={`text-xs font-semibold ${type.text} uppercase tracking-wider`}>{type.label}</span>
            <h3 className="text-slate-800 font-semibold text-base">{log.title}</h3>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-all">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-5">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="avatar-ring">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ background: `linear-gradient(135deg, ${log.authorRoleColor}, ${log.authorRoleColor}dd)` }}
              >
                {log.author[0]}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-semibold">{log.author}</span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ 
                    backgroundColor: `${log.authorRoleColor}15`,
                    color: log.authorRoleColor 
                  }}
                >
                  {log.authorRole}
                </span>
              </div>
              <span className="text-slate-400 text-sm">{formatDateTime(log.createdAt)}</span>
            </div>
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
              <Share2 size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="prose max-w-none mb-5">
            {renderContent(log.content)}
          </div>

          {/* Code Snippets */}
          {log.codeSnippets && log.codeSnippets.length > 0 && (
            <div className="space-y-4">
              {log.codeSnippets.map((snippet, index) => (
                <div key={index} className="code-block overflow-hidden rounded-xl">
                  <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono ml-2">{snippet.language}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(snippet.code, index)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                               bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm bg-slate-900">
                    <code className="text-slate-100 font-mono">{snippet.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {log.reactions && log.reactions.length > 0 && (
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              {log.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full
                           hover:bg-indigo-50 hover:text-indigo-600 transition-all group border border-slate-200
                           hover:border-indigo-200"
                >
                  <span className="text-base">{reaction.emoji}</span>
                  <span className="text-xs text-slate-500 font-medium group-hover:text-indigo-600">
                    {reaction.count}
                  </span>
                </button>
              ))}
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full
                               hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-200
                               hover:border-rose-200 text-slate-400 ml-auto">
                <Heart size={16} />
                <span className="text-xs font-medium">Beğen</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full
                               hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200
                               hover:border-indigo-200 text-slate-400">
                <MessageSquare size={16} />
                <span className="text-xs font-medium">Yorum</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPost;
