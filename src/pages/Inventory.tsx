import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, saveClass, getCurrentQuarter, generateId } from '@/lib/storage';
import { Class, Inventory as InventoryType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Book, DollarSign, FileText, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  type: 'bible' | 'magazine' | 'offering';
  description: string;
  quantity?: number;
  value?: number;
  date: string;
}

export const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [inventoryData, setInventoryData] = useState({
    bibles: 0,
    magazines: 0,
    offerings: 0
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState({
    type: 'bible' as 'bible' | 'magazine' | 'offering',
    description: '',
    quantity: 1,
    value: 0
  });
  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    const allClasses = getClasses();
    if (user?.type === 'professor') {
      const userClasses = allClasses.filter(c => 
        c.teacherIds.includes(user.id) || user.classIds?.includes(c.id)
      );
      setClasses(userClasses);
      if (userClasses.length > 0 && !selectedClass) {
        setSelectedClass(userClasses[0]);
      }
    } else {
      setClasses(allClasses);
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass && selectedClass.inventory) {
      setInventoryData({
        bibles: selectedClass.inventory.bibles || 0,
        magazines: selectedClass.inventory.magazines || 0,
        offerings: selectedClass.inventory.offerings || 0
      });
    }
  }, [selectedClass]);

  const updateInventoryField = (field: keyof typeof inventoryData, value: string) => {
    const numValue = parseInt(value) || 0;
    setInventoryData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const saveInventory = () => {
    if (!selectedClass) return;

    const currentQuarter = getCurrentQuarter();
    const inventory: InventoryType = {
      id: selectedClass.inventory?.id || Date.now().toString(),
      classId: selectedClass.id,
      bibles: inventoryData.bibles,
      magazines: inventoryData.magazines,
      offerings: inventoryData.offerings,
      lastUpdated: new Date().toISOString(),
      quarter: currentQuarter
    };

    const updatedClass = {
      ...selectedClass,
      inventory
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    
    toast({
      title: "Inventário salvo",
      description: "Os dados do inventário foram atualizados com sucesso."
    });
  };

  const getTotalItems = () => {
    return inventoryData.bibles + inventoryData.magazines;
  };

  const getAllInventoryData = () => {
    return classes.map(classData => ({
      className: classData.name,
      teacherNames: classData.teacherNames,
      inventory: classData.inventory || {
        id: '',
        classId: classData.id,
        bibles: 0,
        magazines: 0,
        offerings: 0,
        lastUpdated: '',
        quarter: getCurrentQuarter()
      }
    }));
  };

  const getTotalInventory = () => {
    return classes.reduce((totals, classData) => {
      const inv = classData.inventory;
      return {
        bibles: totals.bibles + (inv?.bibles || 0),
        magazines: totals.magazines + (inv?.magazines || 0),
        offerings: totals.offerings + (inv?.offerings || 0)
      };
    }, { bibles: 0, magazines: 0, offerings: 0 });
  };

  const addInventoryItem = () => {
    if (!newItem.description.trim() || !selectedClass) return;

    const item: InventoryItem = {
      id: generateId(),
      type: newItem.type,
      description: newItem.description.trim(),
      quantity: newItem.type !== 'offering' ? newItem.quantity : undefined,
      value: newItem.type === 'offering' ? newItem.value : undefined,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedItems = [...inventoryItems, item];
    setInventoryItems(updatedItems);
    
    // Update inventory totals
    const newInventoryData = { ...inventoryData };
    if (item.type === 'bible') {
      newInventoryData.bibles += item.quantity || 0;
    } else if (item.type === 'magazine') {
      newInventoryData.magazines += item.quantity || 0;
    } else if (item.type === 'offering') {
      newInventoryData.offerings += item.value || 0;
    }
    
    setInventoryData(newInventoryData);
    
    // Save to class
    const inventory: InventoryType = {
      id: selectedClass.inventory?.id || Date.now().toString(),
      classId: selectedClass.id,
      bibles: newInventoryData.bibles,
      magazines: newInventoryData.magazines,
      offerings: newInventoryData.offerings,
      lastUpdated: new Date().toISOString(),
      quarter: getCurrentQuarter()
    };

    const updatedClass = {
      ...selectedClass,
      inventory
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    
    setNewItem({ type: 'bible', description: '', quantity: 1, value: 0 });
    setIsAddingItem(false);
    
    toast({
      title: "Item adicionado",
      description: `${item.description} foi adicionado ao inventário.`
    });
  };

  const removeInventoryItem = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item || !selectedClass) return;

    const updatedItems = inventoryItems.filter(i => i.id !== itemId);
    setInventoryItems(updatedItems);
    
    // Update inventory totals
    const newInventoryData = { ...inventoryData };
    if (item.type === 'bible') {
      newInventoryData.bibles -= item.quantity || 0;
    } else if (item.type === 'magazine') {
      newInventoryData.magazines -= item.quantity || 0;
    } else if (item.type === 'offering') {
      newInventoryData.offerings -= item.value || 0;
    }
    
    setInventoryData(newInventoryData);
    
    toast({
      title: "Item removido",
      description: "Item foi removido do inventário."
    });
  };

  if (user?.type === 'secretario') {
    const totalInventory = getTotalInventory();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventário Geral</h1>
          <p className="text-gray-600">Visão geral do inventário de todas as classes</p>
        </div>

        {/* Totais Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Book className="w-5 h-5" />
                Total Bíblias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalInventory.bibles}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="w-5 h-5" />
                Total Revistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{totalInventory.magazines}</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <DollarSign className="w-5 h-5" />
                Total Ofertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">R$ {totalInventory.offerings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Package className="w-5 h-5" />
                Total Materiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {totalInventory.bibles + totalInventory.magazines}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventário por Classe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getAllInventoryData().map((data, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {data.className}
                </CardTitle>
                <CardDescription>
                  Professores: {data.teacherNames.join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bíblias:</span>
                    <Badge variant="outline">{data.inventory.bibles}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revistas:</span>
                    <Badge variant="outline">{data.inventory.magazines}</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Ofertas:</span>
                  <span className="font-bold text-green-600">R$ {data.inventory.offerings.toFixed(2)}</span>
                </div>
                {data.inventory.lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Atualizado: {new Date(data.inventory.lastUpdated).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventário</h1>
        <p className="text-gray-600">Gerencie o inventário da sua classe</p>
      </div>

      {selectedClass ? (
        <div className="space-y-6">
          {/* Add Item Button */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Item ao Inventário
                </CardTitle>
                <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
                      <DialogDescription>
                        Adicione bíblias, revistas ou registre ofertas
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-type">Tipo de Item</Label>
                        <select
                          id="item-type"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={newItem.type}
                          onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as 'bible' | 'magazine' | 'offering' }))}
                        >
                          <option value="bible">Bíblia</option>
                          <option value="magazine">Revista</option>
                          <option value="offering">Oferta</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-description">Descrição</Label>
                        <Input
                          id="item-description"
                          placeholder="Descrição do item"
                          value={newItem.description}
                          onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      {newItem.type !== 'offering' ? (
                        <div className="space-y-2">
                          <Label htmlFor="item-quantity">Quantidade</Label>
                          <Input
                            id="item-quantity"
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="item-value">Valor (R$)</Label>
                          <Input
                            id="item-value"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newItem.value}
                            onChange={(e) => setNewItem(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addInventoryItem}>
                        Adicionar Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Inventory Items List */}
          {inventoryItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens do Inventário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {item.type === 'bible' && <Book className="w-5 h-5 text-blue-600" />}
                          {item.type === 'magazine' && <FileText className="w-5 h-5 text-green-600" />}
                          {item.type === 'offering' && <DollarSign className="w-5 h-5 text-yellow-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">
                            {item.type === 'offering' 
                              ? `R$ ${item.value?.toFixed(2)}` 
                              : `Quantidade: ${item.quantity}`
                            } - {new Date(item.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {item.type === 'bible' ? 'Bíblia' : item.type === 'magazine' ? 'Revista' : 'Oferta'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInventoryItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing inventory summary cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações da Classe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {selectedClass.name}
                </CardTitle>
                <CardDescription>
                  Trimestre: {getCurrentQuarter()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Total de Materiais:</span>
                  <Badge variant="outline">{getTotalItems()}</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Ofertas:</span>
                  <Badge variant="default">R$ {inventoryData.offerings.toFixed(2)}</Badge>
                </div>
                
                {selectedClass.inventory?.lastUpdated && (
                  <div className="pt-2 border-t text-center">
                    <p className="text-xs text-gray-500">
                      Última atualização:<br />
                      {new Date(selectedClass.inventory.lastUpdated).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulário de Inventário */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Atualizar Inventário
                </CardTitle>
                <CardDescription>
                  Registre as quantidades de materiais e ofertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bíblias */}
                  <div className="space-y-3">
                    <Label htmlFor="bibles" className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      Bíblias
                    </Label>
                    <Input
                      id="bibles"
                      type="number"
                      min="0"
                      placeholder="Quantidade de bíblias"
                      value={inventoryData.bibles || ''}
                      onChange={(e) => updateInventoryField('bibles', e.target.value)}
                    />
                  </div>

                  {/* Revistas */}
                  <div className="space-y-3">
                    <Label htmlFor="magazines" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Revistas
                    </Label>
                    <Input
                      id="magazines"
                      type="number"
                      min="0"
                      placeholder="Quantidade de revistas"
                      value={inventoryData.magazines || ''}
                      onChange={(e) => updateInventoryField('magazines', e.target.value)}
                    />
                  </div>
                </div>

                {/* Ofertas */}
                <div className="space-y-3">
                  <Label htmlFor="offerings" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ofertas (R$)
                  </Label>
                  <Input
                    id="offerings"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Valor total das ofertas"
                    value={inventoryData.offerings || ''}
                    onChange={(e) => updateInventoryField('offerings', e.target.value)}
                  />
                </div>

                {/* Resumo */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-medium text-gray-900">Resumo do Inventário:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bíblias:</span>
                      <span className="font-medium">{inventoryData.bibles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revistas:</span>
                      <span className="font-medium">{inventoryData.magazines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Materiais:</span>
                      <span className="font-medium">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ofertas:</span>
                      <span className="font-medium">R$ {inventoryData.offerings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={saveInventory} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Inventário
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma classe atribuída</p>
            <p className="text-sm text-gray-400">Entre em contato com o secretário para ser atribuído a uma classe</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
