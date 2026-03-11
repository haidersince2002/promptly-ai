import { useState, useRef } from 'react'
import Markdown from 'react-markdown'
import { RefreshCw, Copy, Edit, FileDown, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { exportToPdf, downloadImage } from '../utils/exportUtils'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const CreationItem = ({item, onRefresh}) => {
    const [expanded, setExpanded] = useState(false)
    const [versions, setVersions] = useState([])
    const [showVersions, setShowVersions] = useState(false)
    const [regenerating, setRegenerating] = useState(false)
    const [editingPrompt, setEditingPrompt] = useState(false)
    const [editedPrompt, setEditedPrompt] = useState('')
    const contentRef = useRef(null)
    const { getToken } = useAuth()

    const copyPrompt = () => {
      const promptText = item.original_prompt || item.prompt
      navigator.clipboard.writeText(promptText)
      toast.success('Prompt copied to clipboard!')
    }

    const regenerate = async () => {
      try {
        setRegenerating(true)
        const { data } = await axios.post('/api/ai/regenerate', 
          { creationId: item.id },
          { headers: { Authorization: `Bearer ${await getToken()}` } }
        )
        if (data.success) {
          toast.success(`Regenerated! Version ${data.version}`)
          if (onRefresh) onRefresh()
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
      setRegenerating(false)
    }

    const loadVersions = async () => {
      if (showVersions) {
        setShowVersions(false)
        return
      }
      try {
        const { data } = await axios.get(`/api/user/get-creation-versions/${item.id}`, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
          setVersions(data.versions)
          setShowVersions(true)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const startEditPrompt = () => {
      setEditedPrompt(item.original_prompt || item.prompt)
      setEditingPrompt(true)
    }

    const handleExportPdf = () => {
      if (contentRef.current) {
        exportToPdf(contentRef.current, `promptly-${item.type}-${item.id}.pdf`)
      }
    }

    const handleDownloadImage = () => {
      downloadImage(item.content, `promptly-image-${item.id}.png`)
    }

  return (
    <div className='p-4 max-w-5xl text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg'>
        <div onClick={()=> setExpanded(!expanded)} className='flex justify-between items-center gap-4 cursor-pointer'>
           <div>
           <h2 className='dark:text-slate-200'>{item.prompt}</h2>
           <p className='text-gray-500 dark:text-gray-400'>{item.type} - {new Date(item.created_at).toLocaleDateString()}
              {item.version > 1 && <span className='ml-2 text-xs text-indigo-500'>(v{item.version})</span>}
           </p>
           </div>
           <div className='flex items-center gap-2'>
             <button className='bg-[#EFF6FF] dark:bg-indigo-900/30 border border-[#BFDBFE] dark:border-indigo-800 text-[#1E40AF] dark:text-indigo-400 px-4 py-1 rounded-full text-xs'>{item.type}</button>
             {expanded ? <ChevronUp className='w-4 h-4 text-gray-400'/> : <ChevronDown className='w-4 h-4 text-gray-400'/>}
           </div>
        </div>

        {
            expanded && (
                <div className='mt-3'>
                    {/* Action buttons */}
                    <div className='flex flex-wrap gap-2 mb-3'>
                      <button onClick={regenerate} disabled={regenerating}
                        className='flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer'>
                        <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`}/>
                        Regenerate
                      </button>
                      <button onClick={copyPrompt}
                        className='flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer'>
                        <Copy className='w-3.5 h-3.5'/>
                        Copy Prompt
                      </button>
                      <button onClick={startEditPrompt}
                        className='flex items-center gap-1 text-xs px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition cursor-pointer'>
                        <Edit className='w-3.5 h-3.5'/>
                        Edit Prompt
                      </button>
                      {item.type === 'image' ? (
                        <button onClick={handleDownloadImage}
                          className='flex items-center gap-1 text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition cursor-pointer'>
                          <Download className='w-3.5 h-3.5'/>
                          Download Image
                        </button>
                      ) : (
                        <button onClick={handleExportPdf}
                          className='flex items-center gap-1 text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition cursor-pointer'>
                          <FileDown className='w-3.5 h-3.5'/>
                          Export as PDF
                        </button>
                      )}
                      <button onClick={loadVersions}
                        className='flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition cursor-pointer'>
                        <RefreshCw className='w-3.5 h-3.5'/>
                        {showVersions ? 'Hide Versions' : 'Show Versions'}
                      </button>
                    </div>

                    {/* Edit prompt inline */}
                    {editingPrompt && (
                      <div className='mb-3 p-3 border border-gray-200 dark:border-slate-600 rounded-lg'>
                        <textarea
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                          rows={3}
                          className='w-full p-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md outline-none'
                        />
                        <div className='flex gap-2 mt-2'>
                          <button onClick={() => {
                            navigator.clipboard.writeText(editedPrompt)
                            toast.success('Edited prompt copied! Use it in any AI tool.')
                            setEditingPrompt(false)
                          }} className='text-xs px-3 py-1.5 bg-primary text-white rounded-lg cursor-pointer'>
                            Copy & Use
                          </button>
                          <button onClick={() => setEditingPrompt(false)} className='text-xs px-3 py-1.5 text-gray-500 dark:text-gray-400 cursor-pointer'>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Version history */}
                    {showVersions && versions.length > 0 && (
                      <div className='mb-3 flex flex-wrap gap-2'>
                        {versions.map((v) => (
                          <span key={v.id} className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                            v.id === item.id 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}>
                            v{v.version} • {new Date(v.created_at).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Content display */}
                    {item.type === 'image' ? (
                        <div>
                            <img src={item.content} alt="image"  className='mt-3 w-full max-w-md rounded-lg'/>
                        </div>
                    ):(
                        <div ref={contentRef} className='mt-3 h-full overflow-y-scroll text-sm text-slate-700 dark:text-slate-300'>
                            <div className='reset-tw'> 
                                <Markdown>
                                {item.content}
                                </Markdown>
                            </div>
                        </div>
                    )}
                </div>
            )
        }
      
    </div>
  )
}

export default CreationItem
