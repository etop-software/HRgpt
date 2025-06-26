import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 


function TypingIndicator() {
  return (
    <div className="message assistant-message typing-indicator-container">
      <div className="message-avatar">🤖</div>
      <div className="message-content typing-content">
        <div className="typing-indicator" aria-label="HR Assistant is typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default function AskHRChat({ isFloating = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const getLastMonthName = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return now.toLocaleString('default', { month: 'long' });
  };
  
  const lastMonth = getLastMonthName();
  
  const suggestions = [
    '📅 Who is absent today?',
    '🏖️ Who is on leave yesterday?',
    '🕝 Who came late today?',
    '🤒 What is the sick Leave policy?',
    '📊 Employee List order by department name',
    '📆 Review upcoming holidays',
    `📈 Total working hours of employees in ${lastMonth} ${new Date().getFullYear()}`
  ];
  

  const getFollowUps = (text) => {
    const normalized = text.toLowerCase();


    if (normalized.includes('absent')) {
      return ['📋 Show all absent employees today', 'Who was absent last week?', '👥 Show absence by department today'];
    }

    if (normalized.includes('leave')) {
      return ['📋 Export leave report','📝 View pending leave approvals','🏠 What’s the Annual Leave  policy?', '🤒 What is the Sick Leave policy?', ' 🏖️ What is the casual Leave policy'];
    }

    if (normalized.includes('holiday')) {
      return ['📆 Show me the holiday calendar.', '📅 Is tomorrow a holiday?', '🕊️ How many holidays this year?'];
    }

    if (normalized.includes('late')) {
      return ['📆 Who came late yesterday'];
    }

    // return ['🤔 Need help with something else?', '💬 Want to ask about policies or leaves?', '🧭 Not sure what to ask? I can suggest!'];
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages,showTyping]);

  const handleSubmit = async (customInput = null) => {
    const question = customInput || input;
    if (!question.trim()) return;
    setShowTyping(true);
    setLoading(true);
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
  
    try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gpt/ask-hr`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question })
});
  
      const data = await res.json();
  
      // Use the question itself to determine follow-ups
      const followUps = getFollowUps(question);
      const assistantMessage = {
        role: 'assistant',
        content: data.data || [],
        isTable: true,
        followUps
      };
  
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    }
  
    setInput('');
    setLoading(false);
    setShowTyping(false);
  };
  

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
  };

  const renderTable = (data) => {
    if (!Array.isArray(data) || data.length === 0) return <div>No results found.</div>;

    const headers = Object.keys(data[0]);

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((key, i) => (
                <th key={i}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
          {data.map((row, idx) => (
  <tr key={idx}>
    {headers.map((key, i) => (
      <td key={i}>
        {typeof row[key] === 'string' && row[key].match(/^\d{4}-\d{2}-\d{2}T/)
          ? new Date(row[key]).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false, // You can change this to true if you want a 12-hour format
            })
          : row[key]}
      </td>
    ))}
  </tr>
))}

          </tbody>
        </table>
        <div className="export-buttons">
  <button onClick={() => exportToExcel(data)} className="export-button">
    📊 Export to Excel
  </button>
  {/* <button onClick={() => exportToPDF(data)} className="export-button">
    📄 Export to PDF
  </button> */}
</div>

      </div>
    );
  };

  const exportToExcel = (data) => {
    // Convert all header keys to uppercase
    const capitalizedData = data.map(row => {
      const newRow = {};
      for (const key in row) {
        newRow[key.toUpperCase()] = row[key];
      }
      return newRow;
    });
  
    const ws = XLSX.utils.json_to_sheet(capitalizedData);
  
    // Set column widths
    const columnWidths = Object.keys(capitalizedData[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = columnWidths;
  
    // Style header row: bold, center, light blue bg
    const headerKeys = Object.keys(capitalizedData[0]);
    headerKeys.forEach((key, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellRef]) return;
  
      ws[cellRef].v = key.toUpperCase(); // Capitalize
      ws[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'D6EAF8' } }, // Light blue
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'BBBBBB' } },
          bottom: { style: 'thin', color: { rgb: 'BBBBBB' } },
          left: { style: 'thin', color: { rgb: 'BBBBBB' } },
          right: { style: 'thin', color: { rgb: 'BBBBBB' } }
        }
      };
    });
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Table Data');
    XLSX.writeFile(wb, 'HRbot_data.xlsx', { bookType: 'xlsx', cellStyles: true });
  };
  
  const exportToPDF = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid data passed to exportToPDF');
      return;
    }
  
    const doc = new jsPDF();
  
    const headers = Object.keys(data[0]);
    const tableData = data.map(row => headers.map(header => row[header]));
  
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 10, // Starts a little higher now that the title is gone
    });
  
    doc.save('HRbot_data.pdf');
  };
  

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>How can I help you today?</h3>
            <p>Ask me about company policies, benefits, leave, or any HR-related questions</p>
            <div className="suggestions">
              {suggestions.map((text, idx) => (
                <button
                  key={idx}
                  className="suggestion-button"
                  onClick={() => {
                    setInput(text);
                    handleSubmit(text);
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{msg.role === 'user' ? 'You' : 'HR Assistant'}</span>
                  <span className="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="message-body">
                  {msg.isTable ? renderTable(msg.content) : msg.content}
                </div>
                 {msg.role === 'assistant' && msg.followUps && (
                  <div className="follow-up-questions">
                    {msg.followUps.map((q, i) => (
                      <button key={i} className="follow-up-button" onClick={() => setInput(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
           {showTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Type your question here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
          className="chat-input"
        />

        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="send-button"
          title="Send message"
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>

        {messages.length > 0 && (
          <button onClick={handleClearChat} className="clear-button" title="Clear conversation">
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>

          </button>
        )}
      </div>

      <style jsx>{`
        .chat-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          background-color: #f9fafb;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background-color: #f9fafb;
          min-height: 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          max-width: 400px;
          line-height: 1.5;
        }
          .typing-indicator-container { display:flex; gap:1rem; max-width:85%; align-items:center; }
        .typing-content { background-color:white; border-radius:12px; padding:0.75rem 1rem; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
        .typing-indicator { display:flex; gap:0.25rem; }
        .typing-indicator span { width:8px; height:8px; background-color:#9ca3af; border-radius:50%; animation:bounce 1s infinite ease-in-out; }
        .typing-indicator span:nth-child(2){animation-delay:0.2s} .typing-indicator span:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: center;
        }

         .follow-up-questions {
          margin-top: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .follow-up-button {
          background-color: #eef2ff;
          color: #1e3a8a;
          border: none;
          border-radius: 9999px;
          padding: 0.5rem 0.85rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .follow-up-button:hover {
          background-color: #dbeafe;
        }

        .suggestion-button {
          padding: 0.5rem 1rem;
          background-color: #e0e7ff;
          color: #1e40af;
          border: none;
          border-radius: 9999px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
.suggestion-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

        .suggestion-button:hover {
          background-color: #c7d2fe;
        }

        .message {
          display: flex;
          gap: 1rem;
          max-width: 85%;
          animation: fadeIn 0.3s ease-out;
        }

        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .assistant-message {
          align-self: flex-start;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .user-message .message-avatar {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .assistant-message .message-avatar {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .message-content {
          background-color: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          max-width: 100%;
        }

        .user-message .message-content {
          background-color: #2563eb;
          color: white;
          border-radius: 12px 12px 0 12px;
        }

        .assistant-message .message-content {
          background-color: white;
          border-radius: 12px 12px 12px 0;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .message-sender {
          font-weight: 600;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .message-body {
          font-size: 0.95rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

       .table-container {
  overflow-x: auto;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-width: 100%;
  display: block;
}
.data-table {
  width: max-content; /* important */
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

        .data-table th {
          background-color: #eff6ff;
          color: #1e40af;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
.export-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.export-button {
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  border: none;
  height: 32px;
  width: auto;
  font-size: 0.8rem;
  padding: 0 12px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
}

.export-button:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #4338ca, #2563eb);
}

        .input-container {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background-color: white;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 12px 12px;
        }

        .chat-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border-radius: 9999px;
          border: 1px solid #e5e7eb;
          font-size: 0.95rem;
          background-color: #f9fafb;
        }

        .chat-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .send-button,
        .clear-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }

        .send-button {
          background-color: #2563eb;
          color: white;
        }

        .send-button:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .send-button:active {
          transform: translateY(1px);
        }

        .send-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .clear-button {
          background-color: #f3f4f6;
          color: #6b7280;
        }

        .clear-button:hover {
          background-color: #e5e7eb;
          color: #4b5563;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-container {
            border-radius: 0;
          }

          .message {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
