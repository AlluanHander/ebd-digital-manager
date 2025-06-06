import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { Plus, UserPlus, Edit, Trash2 } from 'lucide-react';

interface Visitor {
  id: string;
  name: string;
  age: number;
  phone: string;
  visitDate: string;
  interest: 'alto' | 'medio' | 'baixo';
  observations?: string;
}

export const Visitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [newVisitor, setNewVisitor] = useState<Omit<Visitor, 'id'>>({
    name: '',
    age: 18,
    phone: '',
    visitDate: new Date().toISOString().split('T')[0],
    interest: 'medio',
    observations: '',
  });
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load visitors from local storage on component mount
    const storedVisitors = localStorage.getItem('visitors');
    if (storedVisitors) {
      setVisitors(JSON.parse(storedVisitors));
    }
  }, []);

  useEffect(() => {
    // Save visitors to local storage whenever the visitors state changes
    localStorage.setItem('visitors', JSON.stringify(visitors));
  }, [visitors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVisitor(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVisitor = () => {
    if (!newVisitor.name || !newVisitor.phone) {
      toast({
        title: "Erro ao adicionar visitante",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.random().toString(36).substring(2, 15);
    const visitorToAdd: Visitor = { ...newVisitor, id: newId };
    setVisitors(prev => [...prev, visitorToAdd]);
    setNewVisitor({
      name: '',
      age: 18,
      phone: '',
      visitDate: new Date().toISOString().split('T')[0],
      interest: 'medio',
      observations: '',
    });

    toast({
      title: "Visitante adicionado",
      description: `Visitante ${newVisitor.name} adicionado com sucesso!`,
    });
  };

  const handleDeleteVisitor = (id: string) => {
    setVisitors(prev => prev.filter(visitor => visitor.id !== id));
    toast({
      title: "Visitante removido",
      description: "Visitante removido com sucesso!",
    });
  };

  const handleEditVisitor = (visitor: Visitor) => {
    setEditingVisitor({ ...visitor });
  };

  const handleSaveEdit = () => {
    if (!editingVisitor) return;

    setVisitors(prev =>
      prev.map(visitor =>
        visitor.id === editingVisitor.id ? editingVisitor : visitor
      )
    );
    setEditingVisitor(null);
    toast({
      title: "Visitante atualizado",
      description: "Visitante atualizado com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          <UserPlus className="w-6 h-6 mr-2 inline-block" />
          Visitantes
        </CardTitle>
        <CardDescription>
          Gerencie os visitantes da sua igreja de forma fácil e eficiente.
        </CardDescription>
      </div>

      {/* Add Visitor Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Visitante
          </CardTitle>
          <CardDescription>
            Adicione um novo visitante ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={newVisitor.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                name="age"
                value={newVisitor.age.toString()}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={newVisitor.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitDate">Data da Visita</Label>
              <Input
                id="visitDate"
                type="date"
                name="visitDate"
                value={newVisitor.visitDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest">Nível de Interesse</Label>
              <Select
                name="interest"
                value={newVisitor.interest}
                onValueChange={(value: 'alto' | 'medio' | 'baixo') =>
                  setNewVisitor(prev => ({ ...prev, interest: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                name="observations"
                placeholder="Observações sobre o visitante..."
                value={newVisitor.observations}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Button onClick={handleAddVisitor}>Adicionar Visitante</Button>
        </CardContent>
      </Card>

      {/* Visitors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Lista de Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum visitante cadastrado ainda.</p>
              <p className="text-sm">Use o formulário acima para adicionar visitantes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data da Visita</TableHead>
                    <TableHead>Interesse</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium">{visitor.name}</TableCell>
                      <TableCell>{visitor.age} anos</TableCell>
                      <TableCell>{visitor.phone}</TableCell>
                      <TableCell>{visitor.visitDate}</TableCell>
                      <TableCell>
                        <Badge variant={visitor.interest === 'alto' ? 'default' : visitor.interest === 'medio' ? 'secondary' : 'outline'}>
                          {visitor.interest === 'alto' ? 'Alto' : visitor.interest === 'medio' ? 'Médio' : 'Baixo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={visitor.observations || ''}>
                        {visitor.observations || 'Nenhuma observação'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVisitor(visitor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVisitor(visitor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Visitor Dialog */}
      <Dialog open={editingVisitor !== null} onOpenChange={(open) => !open && setEditingVisitor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Visitante</DialogTitle>
          </DialogHeader>
          {editingVisitor && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingVisitor.name}
                  onChange={(e) => setEditingVisitor({...editingVisitor, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-age">Idade</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editingVisitor.age.toString()}
                  onChange={(e) => setEditingVisitor({...editingVisitor, age: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editingVisitor.phone}
                  onChange={(e) => setEditingVisitor({...editingVisitor, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-visitDate">Data da Visita</Label>
                <Input
                  id="edit-visitDate"
                  type="date"
                  value={editingVisitor.visitDate}
                  onChange={(e) => setEditingVisitor({...editingVisitor, visitDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-interest">Nível de Interesse</Label>
                <Select
                  value={editingVisitor.interest}
                  onValueChange={(value: 'alto' | 'medio' | 'baixo') => 
                    setEditingVisitor({...editingVisitor, interest: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-observations">Observações</Label>
                <Textarea
                  id="edit-observations"
                  value={editingVisitor.observations || ''}
                  onChange={(e) => setEditingVisitor({...editingVisitor, observations: e.target.value})}
                  placeholder="Observações sobre o visitante..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVisitor(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
