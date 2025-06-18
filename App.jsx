import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Search, Copy, ExternalLink, Plus, X, Lightbulb, Target, FileText, Globe } from 'lucide-react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [queryParts, setQueryParts] = useState([])

  // 検索コマンドの定義
  const searchCommands = {
    basic: [
      { 
        command: '""', 
        name: '完全一致', 
        description: 'ダブルクオーテーションで囲んだフレーズと完全に一致する結果を検索',
        example: '"東京オリンピック 2024"',
        status: 'active'
      },
      { 
        command: '-', 
        name: '除外', 
        description: 'ハイフンの直後に指定したキーワードを含むページを除外',
        example: 'プログラミング -Python',
        status: 'active'
      },
      { 
        command: 'OR', 
        name: 'いずれかを含む', 
        description: '指定したキーワードのいずれかを含むページを検索',
        example: 'JavaScript OR TypeScript',
        status: 'active'
      },
      { 
        command: 'AND', 
        name: 'すべてを含む', 
        description: '指定したキーワードをすべて含むページを検索',
        example: 'React AND Redux',
        status: 'active'
      },
      { 
        command: '*', 
        name: 'ワイルドカード', 
        description: '不明な単語やフレーズのプレースホルダーとして使用',
        example: '* プログラミング 入門',
        status: 'active'
      },
      { 
        command: '()', 
        name: 'グループ化', 
        description: '複数の検索条件をまとめて優先順位を制御',
        example: '(JavaScript OR TypeScript) AND React',
        status: 'active'
      },
      { 
        command: '..', 
        name: '数値範囲', 
        description: '2つの数値の間の範囲を検索',
        example: '価格 1000..5000',
        status: 'active'
      }
    ],
    siteFile: [
      { 
        command: 'site:', 
        name: 'サイト内検索', 
        description: '指定したウェブサイト内のみを検索',
        example: 'site:github.com React',
        status: 'active'
      },
      { 
        command: 'filetype:', 
        name: 'ファイル形式', 
        description: '指定したファイル形式の結果のみを検索',
        example: 'filetype:pdf 年次報告書',
        status: 'active'
      },
      { 
        command: 'cache:', 
        name: 'キャッシュ表示', 
        description: 'Googleが最後にインデックスした時点のページを表示',
        example: 'cache:example.com',
        status: 'active'
      },
      { 
        command: 'related:', 
        name: '関連サイト', 
        description: '指定したURLと関連性があるサイトを検索',
        example: 'related:github.com',
        status: 'limited'
      }
    ],
    target: [
      { 
        command: 'intitle:', 
        name: 'タイトル内検索', 
        description: 'ページのタイトルに指定したキーワードを含むページを検索',
        example: 'intitle:React チュートリアル',
        status: 'active'
      },
      { 
        command: 'allintitle:', 
        name: 'タイトル内検索（全て）', 
        description: 'ページのタイトルに指定したキーワードの全てを含むページを検索',
        example: 'allintitle:React Redux チュートリアル',
        status: 'active'
      },
      { 
        command: 'inurl:', 
        name: 'URL内検索', 
        description: 'ページのURLに指定したキーワードを含むページを検索',
        example: 'inurl:blog React',
        status: 'active'
      },
      { 
        command: 'allinurl:', 
        name: 'URL内検索（全て）', 
        description: 'ページのURLに指定したキーワードの全てを含むページを検索',
        example: 'allinurl:blog react tutorial',
        status: 'active'
      },
      { 
        command: 'intext:', 
        name: 'テキスト内検索', 
        description: 'ページのコンテンツに指定した語句を含むページを検索',
        example: 'intext:"API設計"',
        status: 'active'
      },
      { 
        command: 'allintext:', 
        name: 'テキスト内検索（全て）', 
        description: '指定した語句がすべて含まれるページを検索',
        example: 'allintext:React hooks useState',
        status: 'active'
      }
    ]
  }

  // 業務別テンプレート
  const businessTemplates = [
    {
      category: 'マーケティング・競合調査',
      icon: Target,
      templates: [
        {
          name: '競合サイト分析',
          query: 'site:competitor.com (価格 OR 料金 OR プラン)',
          description: '競合他社の価格情報を調査'
        },
        {
          name: '業界レポート検索',
          query: 'filetype:pdf "市場調査" OR "業界レポート" 2024',
          description: '最新の業界レポートを検索'
        },
        {
          name: 'プレスリリース調査',
          query: 'intitle:"プレスリリース" (新製品 OR 新サービス) -求人',
          description: '競合の新製品・サービス情報を収集'
        }
      ]
    },
    {
      category: '技術調査・開発',
      icon: FileText,
      templates: [
        {
          name: 'API仕様書検索',
          query: 'filetype:pdf OR filetype:doc "API仕様" OR "API documentation"',
          description: 'API関連の技術文書を検索'
        },
        {
          name: 'エラー解決方法',
          query: 'site:stackoverflow.com OR site:github.com "エラーメッセージ"',
          description: '技術的な問題の解決方法を検索'
        },
        {
          name: 'ライブラリ比較',
          query: '"ライブラリ名1" vs "ライブラリ名2" (比較 OR 違い OR メリット)',
          description: '技術選定のための比較情報を検索'
        }
      ]
    },
    {
      category: '法務・コンプライアンス',
      icon: Globe,
      templates: [
        {
          name: '法令・規制検索',
          query: 'site:e-gov.go.jp OR site:cao.go.jp filetype:pdf "法律名"',
          description: '政府サイトから法令情報を検索'
        },
        {
          name: '判例検索',
          query: '"判例" OR "裁判例" "キーワード" filetype:pdf',
          description: '関連する判例を検索'
        },
        {
          name: 'ガイドライン検索',
          query: '"ガイドライン" OR "指針" "業界名" filetype:pdf 2023..2024',
          description: '最新のガイドラインを検索'
        }
      ]
    }
  ]

  // クエリ部品を追加
  const addQueryPart = (type, value) => {
    if (!value.trim()) return
    
    const newPart = {
      id: Date.now(),
      type,
      value: value.trim()
    }
    setQueryParts([...queryParts, newPart])
  }

  // クエリ部品を削除
  const removeQueryPart = (id) => {
    setQueryParts(queryParts.filter(part => part.id !== id))
  }

  // クエリを構築
  useEffect(() => {
    const builtQuery = queryParts.map(part => {
      switch (part.type) {
        case 'keyword':
          return part.value
        case 'exact':
          return `"${part.value}"`
        case 'exclude':
          return `-${part.value}`
        case 'site':
          return `site:${part.value}`
        case 'filetype':
          return `filetype:${part.value}`
        case 'intitle':
          return `intitle:${part.value}`
        case 'inurl':
          return `inurl:${part.value}`
        case 'intext':
          return `intext:${part.value}`
        default:
          return part.value
      }
    }).join(' ')
    setQuery(builtQuery)
  }, [queryParts])

  // クリップボードにコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(query)
  }

  // Google検索を開く
  const searchGoogle = () => {
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
    }
  }

  // テンプレートを適用
  const applyTemplate = (templateQuery) => {
    setQuery(templateQuery)
    setQueryParts([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Google検索クエリビルダー</h1>
                <p className="text-sm text-gray-600">仕事で使える高品質な検索コマンド作成ツール</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メインクエリビルダー */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>インタラクティブ・クエリビルダー</span>
            </CardTitle>
            <CardDescription>
              以下のツールを使って、検索コマンドを組み合わせたカスタムクエリを作成しましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 作成中のクエリ表示 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作成中のクエリ:
              </label>
              <div className="flex space-x-2">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ここに検索クエリが表示されます..."
                  className="flex-1"
                  rows={3}
                />
                <div className="flex flex-col space-y-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    コピー
                  </Button>
                  <Button onClick={searchGoogle} className="bg-blue-600 hover:bg-blue-700" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    検索
                  </Button>
                </div>
              </div>
            </div>

            {/* クエリ部品表示 */}
            {queryParts.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  追加された要素:
                </label>
                <div className="flex flex-wrap gap-2">
                  {queryParts.map((part) => (
                    <Badge key={part.id} variant="secondary" className="flex items-center space-x-1">
                      <span>{part.type}: {part.value}</span>
                      <button
                        onClick={() => removeQueryPart(part.id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* クエリビルダーフォーム */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">基本</TabsTrigger>
                <TabsTrigger value="site">サイト・ファイル</TabsTrigger>
                <TabsTrigger value="target">対象指定</TabsTrigger>
                <TabsTrigger value="templates">テンプレート</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QueryInput
                    label="キーワード"
                    placeholder="例: React チュートリアル"
                    onAdd={(value) => addQueryPart('keyword', value)}
                  />
                  <QueryInput
                    label="完全一致"
                    placeholder="例: React Hooks"
                    onAdd={(value) => addQueryPart('exact', value)}
                  />
                  <QueryInput
                    label="除外"
                    placeholder="例: 古い"
                    onAdd={(value) => addQueryPart('exclude', value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="site" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QueryInput
                    label="サイト内検索"
                    placeholder="例: github.com"
                    onAdd={(value) => addQueryPart('site', value)}
                  />
                  <QueryInput
                    label="ファイル形式"
                    placeholder="例: pdf"
                    onAdd={(value) => addQueryPart('filetype', value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="target" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QueryInput
                    label="タイトル内検索"
                    placeholder="例: チュートリアル"
                    onAdd={(value) => addQueryPart('intitle', value)}
                  />
                  <QueryInput
                    label="URL内検索"
                    placeholder="例: blog"
                    onAdd={(value) => addQueryPart('inurl', value)}
                  />
                  <QueryInput
                    label="テキスト内検索"
                    placeholder="例: API設計"
                    onAdd={(value) => addQueryPart('intext', value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                {businessTemplates.map((category) => (
                  <Card key={category.category}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <category.icon className="h-5 w-5" />
                        <span>{category.category}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        {category.templates.map((template) => (
                          <div key={template.name} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Button
                                onClick={() => applyTemplate(template.query)}
                                size="sm"
                                variant="outline"
                              >
                                適用
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                            <code className="text-xs bg-gray-100 p-2 rounded block">
                              {template.query}
                            </code>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 検索コマンド一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CommandSection title="基本の絞り込み" commands={searchCommands.basic} />
          <CommandSection title="サイト・ファイル" commands={searchCommands.siteFile} />
          <CommandSection title="検索対象の指定" commands={searchCommands.target} />
        </div>
      </div>
    </div>
  )
}

// クエリ入力コンポーネント
function QueryInput({ label, placeholder, onAdd }) {
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value)
      setValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex space-x-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// コマンドセクションコンポーネント
function CommandSection({ title, commands }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commands.map((cmd) => (
            <div key={cmd.command} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {cmd.command}
                  </code>
                  <span className="font-medium">{cmd.name}</span>
                </div>
                <Badge 
                  variant={cmd.status === 'active' ? 'default' : cmd.status === 'limited' ? 'secondary' : 'destructive'}
                >
                  {cmd.status === 'active' ? '動作中' : cmd.status === 'limited' ? '制限あり' : '廃止済み'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{cmd.description}</p>
              <code className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                {cmd.example}
              </code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default App

