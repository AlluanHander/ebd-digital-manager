import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUsers, saveUser, getClasses, saveClass, generateId, getChurchName, setChurchName } from '@/lib/storage';
import { User, Class } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Church, Users, BookOpen, Trash2, Edit, Save, Plus, Mail, Key, Database, UserPlus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [churchNameInput, setChurchNameInput] = useState('');
  const [isEditingChurch, setIsEditingChurch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);

  useEffect(() => {
    const allUsers = getUsers();
    const allClasses = getClasses();
    const currentChurchName = getChurchName();
    
    setUsers(allUsers);
    setClasses(allClasses);
    setChurchNameInput(currentChurchName || '');
  }, []);

  const updateChurchName = () => {
    if (!churchNameInput.trim()) return;
    
    setChurchName(churchNameInput.trim());
    setIsEditingChurch(false);
    
    toast({
      title: "Nome da igreja atualizado",
      description: "O nome da igreja foi atualizado com sucesso."
    });
  };

  const resetUserPassword = () => {
    if (!selectedUser || !newPassword.trim()) return;
    
    toast({
      title: "Senha redefinida",
      description: `Nova senha definida para ${selectedUser.name}.`,
    });
    
    setSelectedUser(null);
    setNewPassword('');
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.type === 'professor' && userToDelete.classIds) {
      userToDelete.classIds.forEach(classId => {
        const classData = classes.find(c => c.id === classId);
        if (classData) {
          const updatedClass = {
            ...classData,
            teacherIds: classData.teacherIds.filter(id => id !== userId),
            teacherNames: classData.teacherNames.filter((_, index) => classData.teacherIds[index] !== userId)
          };
          saveClass(updatedClass);
        }
      });
    }

    setUsers(users.filter(u => u.id !== userId));
    
    toast({
      title: "Usuário removido",
      description: `${userToDelete.name} foi removido do sistema.`
    });
  };

  const createClass = () => {
    if (!newClassName.trim()) return;

    const newClass: Class = {
      id: generateId(),
      name: newClassName.trim(),
      teacherIds: [],
      teacherNames: [],
      students: [],
      visitors: [],
      announcements: [],
      birthdays: [],
      inventory: {
        id: generateId(),
        classId: generateId(),
        bibles: 0,
        magazines: 0,
        offerings: 0,
        lastUpdated: new Date().toISOString(),
        quarter: getCurrentQuarter()
      },
      createdAt: new Date().toISOString()
    };

    saveClass(newClass);
    setClasses([...classes, newClass]);
    setNewClassName('');
    setIsCreatingClass(false);
    
    toast({
      title: "Classe criada",
      description: `A classe ${newClass.name} foi criada com sucesso.`
    });
  };

  const assignTeacherToClass = (teacherId: string) => {
    if (!selectedClass || !teacherId) return;

    const teacher = users.find(u => u.id === teacherId);
    if (!teacher) return;

    // Atualizar a classe
    const updatedClass = {
      ...selectedClass,
      teacherIds: [...selectedClass.teacherIds, teacherId],
      teacherNames: [...selectedClass.teacherNames, teacher.name]
    };

    // Atualizar o usuário professor
    const updatedTeacher = {
      ...teacher,
      classIds: [...(teacher.classIds || []), selectedClass.id]
    };

    saveClass(updatedClass);
    saveUser(updatedTeacher);
    
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    setUsers(users.map(u => u.id === updatedTeacher.id ? updatedTeacher : u));
    
    setIsAssigningTeacher(false);
    setSelectedClass(null);
    
    toast({
      title: "Professor atribuído",
      description: `${teacher.name} foi atribuído à classe ${updatedClass.name}.`
    });
  };

  const removeTeacherFromClass = (classId: string, teacherId: string) => {
    const classData = classes.find(c => c.id === classId);
    const teacher = users.find(u => u.id === teacherId);
    
    if (!classData || !teacher) return;

    // Atualizar a classe
    const teacherIndex = classData.teacherIds.indexOf(teacherId);
    const updatedClass = {
      ...classData,
      teacherIds: classData.teacherIds.filter(id => id !== teacherId),
      teacherNames: classData.teacherNames.filter((_, index) => index !== teacherIndex)
    };

    // Atualizar o usuário professor
    const updatedTeacher = {
      ...teacher,
      classIds: (teacher.classIds || []).filter(id => id !== classId)
    };

    saveClass(updatedClass);
    saveUser(updatedTeacher);
    
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    setUsers(users.map(u => u.id === updatedTeacher.id ? updatedTeacher : u));
    
    toast({
      title: "Professor removido",
      description: `${teacher.name} foi removido da classe ${updatedClass.name}.`
    });
  };

  const deleteClass = (classId: string) => {
    const classToDelete = classes.find(c => c.id === classId);
    if (!classToDelete) return;

    const updatedUsers = users.map(user => {
      if (user.type === 'professor' && user.classIds?.includes(classId)) {
        return {
          ...user,
          classIds: user.classIds.filter(id => id !== classId)
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    updatedUsers.forEach(saveUser);
    
    setClasses(classes.filter(c => c.id !== classId));
    
    toast({
      title: "Classe removida",
      description: `A classe ${classToDelete.name} foi removida do sistema.`
    });
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return `${year}-Q${Math.floor(month / 3) + 1}`;
  };

  const clearAllData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      users: getUsers(),
      classes: getClasses(),
      churchName: getChurchName(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebd-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup criado",
      description: "Os dados foram exportados com sucesso."
    });
  };

  if (user?.type !== 'secretario') {
    return (
      <div className="text-center py-20">
        <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600">Apenas secretários podem acessar as configurações.</p>
      </div>
    );
  }

  const professors = users.filter(u => u.type === 'professor');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie todas as configurações do sistema EBD Digital</p>
      </div>

      {/* Configurações da Igreja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="w-5 h-5" />
            Configurações da Igreja
          </CardTitle>
          <CardDescription>
            Configure as informações básicas da igreja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="church-name">Nome da Igreja</Label>
              <Input
                id="church-name"
                value={churchNameInput}
                onChange={(e) => setChurchNameInput(e.target.value)}
                disabled={!isEditingChurch}
                placeholder="Digite o nome da igreja"
              />
            </div>
            <div className="flex gap-2">
              {isEditingChurch ? (
                <>
                  <Button onClick={updateChurchName} size="sm">
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingChurch(false)} size="sm">
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditingChurch(true)} size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Classes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Gerenciamento de Classes
              </CardTitle>
              <CardDescription>
                Crie, edite ou remova classes da EBD e atribua professores
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreatingClass(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Classe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreatingClass && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Criar Nova Classe</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da classe"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
                <Button onClick={createClass}>
                  <Save className="w-4 h-4 mr-1" />
                  Criar
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingClass(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {classes.map(classData => (
              <div key={classData.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-lg">{classData.name}</h4>
                    <p className="text-sm text-gray-500">
                      {classData.students.length} alunos • {classData.teacherNames.length} professores
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClass(classData);
                        setIsAssigningTeacher(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Atribuir Professor
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteClass(classData.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {classData.teacherNames.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Professores Atribuídos:</h5>
                    <div className="flex flex-wrap gap-2">
                      {classData.teacherNames.map((teacherName, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                          <span>{teacherName}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-red-500 hover:text-red-700"
                            onClick={() => removeTeacherFromClass(classData.id, classData.teacherIds[index])}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dialog para atribuir professor */}
          <Dialog open={isAssigningTeacher} onOpenChange={setIsAssigningTeacher}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Professor à Classe</DialogTitle>
                <DialogDescription>
                  Selecione um professor para atribuir à classe {selectedClass?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Professor</Label>
                  <Select onValueChange={assignTeacherToClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professors
                        .filter(prof => !selectedClass?.teacherIds.includes(prof.id))
                        .map(professor => (
                          <SelectItem key={professor.id} value={professor.id}>
                            {professor.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssigningTeacher(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Gerenciamento de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciamento de Usuários
          </CardTitle>
          <CardDescription>
            Gerencie usuários e senhas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(userData => (
              <div key={userData.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{userData.name}</h4>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                      <Badge variant={userData.type === 'secretario' ? 'default' : 'outline'}>
                        {userData.type === 'secretario' ? 'Secretário' : 'Professor'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(userData)}
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Redefinir Senha
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUser(userData.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedUser && (
            <div className="mt-6 p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium mb-3">Redefinir Senha - {selectedUser.name}</h4>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button onClick={resetUserPassword}>
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup e Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup e Dados
          </CardTitle>
          <CardDescription>
            Faça backup ou limpe os dados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={exportData} className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Exportar Dados (Backup)
            </Button>
            <Button onClick={clearAllData} variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>• O backup inclui todos os usuários, classes, presenças e dados do sistema</p>
            <p>• Limpar dados irá remover permanentemente todas as informações</p>
            <p>• Recomendamos fazer backup regularmente</p>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Usuários</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{classes.length}</div>
              <div className="text-sm text-gray-600">Classes</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {classes.reduce((sum, c) => sum + c.students.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Alunos</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {classes.reduce((sum, c) => sum + c.visitors.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Visitantes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
