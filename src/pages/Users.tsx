import { useState, useEffect } from 'react';
import { getUsers, saveUser, getClasses, saveClass, generateId, saveProfessor, getProfessors } from '@/lib/storage';
import { User, Class } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users as UsersIcon, UserPlus, Edit, Trash2, Save, Eye, EyeOff, Key, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const Users = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretaryPassword, setShowSecretaryPassword] = useState(false);
  const [isEditingSecretary, setIsEditingSecretary] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    type: 'professor' as 'professor' | 'secretario',
    churchName: '',
    classIds: [] as string[]
  });

  const [secretaryCredentials, setSecretaryCredentials] = useState({
    username: 'admin',
    password: '1234'
  });

  const [passwordChange, setPasswordChange] = useState({
    userId: '',
    newPassword: ''
  });

  useEffect(() => {
    const allUsers = getUsers();
    const professors = getProfessors();
    const allClasses = getClasses();
    
    const combinedUsers = [...allUsers];
    professors.forEach(prof => {
      const existingIndex = combinedUsers.findIndex(u => u.id === prof.id || u.username === prof.username);
      if (existingIndex >= 0) {
        combinedUsers[existingIndex] = prof;
      } else {
        combinedUsers.push(prof);
      }
    });
    
    setUsers(combinedUsers);
    setClasses(allClasses);
    console.log('Usuários carregados:', combinedUsers);

    // Carregar credenciais do secretário do localStorage
    const savedSecretaryCredentials = localStorage.getItem('secretary_credentials');
    if (savedSecretaryCredentials) {
      setSecretaryCredentials(JSON.parse(savedSecretaryCredentials));
    }
  }, []);

  const saveSecretaryCredentials = () => {
    if (!secretaryCredentials.username.trim() || !secretaryCredentials.password.trim()) {
      toast({
        title: "Erro",
        description: "Usuário e senha são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('secretary_credentials', JSON.stringify(secretaryCredentials));
    setIsEditingSecretary(false);
    
    toast({
      title: "Credenciais atualizadas",
      description: "As credenciais do secretário foram salvas com sucesso."
    });
  };

  const changeUserPassword = (userId: string) => {
    if (!passwordChange.newPassword.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma nova senha.",
        variant: "destructive"
      });
      return;
    }

    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    const updatedUser = {
      ...userToUpdate,
      password: passwordChange.newPassword
    };

    saveUser(updatedUser);
    if (updatedUser.type === 'professor') {
      saveProfessor(updatedUser);
    }
    
    setUsers(users.map(u => u.id === userId ? updatedUser : u));
    setPasswordChange({ userId: '', newPassword: '' });
    setShowPasswordChange(null);
    
    toast({
      title: "Senha alterada",
      description: `A senha de ${userToUpdate.name} foi alterada com sucesso.`
    });
  };

  const createUser = () => {
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim() || !newUser.phone.trim()) {
      toast({
        title: "Erro no cadastro",
        description: "Preencha todos os campos obrigatórios (Nome, Usuário, Senha e Telefone).",
        variant: "destructive"
      });
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast({
        title: "Erro no cadastro",
        description: "Este nome de usuário já está em uso.",
        variant: "destructive"
      });
      return;
    }

    const user: User = {
      id: generateId(),
      name: newUser.name.trim(),
      email: newUser.email.trim() || `${newUser.username}@ebd.local`,
      username: newUser.username.trim(),
      password: newUser.password,
      phone: newUser.phone.trim(),
      type: newUser.type,
      classIds: newUser.classIds,
      churchName: 'Igreja Local',
      createdAt: new Date().toISOString()
    };

    saveUser(user);
    
    if (user.type === 'professor') {
      saveProfessor(user);
    }
    
    if (newUser.type === 'professor' && newUser.classIds.length > 0) {
      newUser.classIds.forEach(classId => {
        const classData = classes.find(c => c.id === classId);
        if (classData) {
          const updatedClass = {
            ...classData,
            teacherIds: [...classData.teacherIds, user.id],
            teacherNames: [...classData.teacherNames, user.name]
          };
          saveClass(updatedClass);
        }
      });
    }

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', username: '', password: '', phone: '', type: 'professor', churchName: '', classIds: [] });
    setIsCreating(false);
    
    toast({
      title: "Professor cadastrado",
      description: `${user.name} foi cadastrado com sucesso. Usuário: ${user.username}, Senha: ${user.password}`
    });
  };

  const updateUser = () => {
    if (!editingUser) return;

    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.phone.trim()) {
      toast({
        title: "Erro na atualização",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (users.some(u => u.username === newUser.username && u.id !== editingUser.id)) {
      toast({
        title: "Erro na atualização",
        description: "Este nome de usuário já está em uso.",
        variant: "destructive"
      });
      return;
    }

    const updatedUser = {
      ...editingUser,
      name: newUser.name.trim(),
      email: newUser.email.trim() || `${newUser.username}@ebd.local`,
      username: newUser.username.trim(),
      password: newUser.password || editingUser.password,
      phone: newUser.phone.trim(),
      type: newUser.type,
      churchName: 'Igreja Local',
      classIds: newUser.classIds
    };

    saveUser(updatedUser);
    if (updatedUser.type === 'professor') {
      saveProfessor(updatedUser);
    }
    
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
    setNewUser({ name: '', email: '', username: '', password: '', phone: '', type: 'professor', churchName: '', classIds: [] });
    
    toast({
      title: "Professor atualizado",
      description: "As informações foram atualizadas com sucesso."
    });
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

  const startEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '',
      phone: user.phone,
      type: user.type,
      churchName: user.churchName,
      classIds: user.classIds || []
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setIsCreating(false);
    setNewUser({ name: '', email: '', username: '', password: '', phone: '', type: 'professor', churchName: '', classIds: [] });
  };

  const toggleClassAssignment = (classId: string) => {
    setNewUser(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const getClassNames = (classIds: string[]) => {
    return classIds.map(id => {
      const classData = classes.find(c => c.id === id);
      return classData?.name || 'Classe não encontrada';
    }).join(', ');
  };

  const professorUsers = users.filter(u => u.type === 'professor');
  const secretaryUsers = users.filter(u => u.type === 'secretario');

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gerenciamento do Sistema</h1>
        <p className="text-sm sm:text-base text-gray-600">Gerencie credenciais e professores</p>
      </div>

      {/* Credenciais do Secretário */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 text-base sm:text-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Credenciais do Secretário
          </CardTitle>
          <CardDescription className="text-purple-600">
            Configure o usuário e senha para acesso do secretário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingSecretary ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Usuário:</strong> {secretaryCredentials.username}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Senha:</strong> {'*'.repeat(secretaryCredentials.password.length)}
                </p>
              </div>
              <Button onClick={() => setIsEditingSecretary(true)} size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Alterar Credenciais
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secretary-username">Usuário</Label>
                  <Input
                    id="secretary-username"
                    placeholder="Digite o usuário"
                    value={secretaryCredentials.username}
                    onChange={(e) => setSecretaryCredentials(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretary-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="secretary-password"
                      type={showSecretaryPassword ? "text" : "password"}
                      placeholder="Digite a senha"
                      value={secretaryCredentials.password}
                      onChange={(e) => setSecretaryCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2"
                      onClick={() => setShowSecretaryPassword(!showSecretaryPassword)}
                    >
                      {showSecretaryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveSecretaryCredentials} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={() => setIsEditingSecretary(false)} variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-sm sm:text-base">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-800">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 text-sm sm:text-base">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Professores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-800">{professorUsers.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700 text-sm sm:text-base">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Secretários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-800">{secretaryUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Criação/Edição */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              {editingUser ? 'Editar Professor' : 'Novo Professor'}
            </CardTitle>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} size="sm">
                Cadastrar Professor
              </Button>
            )}
          </div>
        </CardHeader>
        
        {isCreating && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome do Professor *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Usuário *</Label>
                  <Input
                    id="username"
                    placeholder="ex: joao123"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha {editingUser ? '(deixe vazio para não alterar)' : '*'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={editingUser ? "Nova senha (opcional)" : "ex: 123456"}
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={editingUser ? updateUser : createUser} className="flex items-center gap-2" size="sm">
                <Save className="w-4 h-4" />
                {editingUser ? 'Atualizar' : 'Cadastrar'}
              </Button>
              <Button variant="outline" onClick={cancelEdit} size="sm">
                Cancelar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Professores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Professores Cadastrados</CardTitle>
          <CardDescription className="text-sm">Lista de todos os professores do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {professorUsers.length > 0 ? (
            <div className="space-y-3">
              {professorUsers.map(user => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Usuário: {user.username}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Senha: {user.password}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Telefone: {user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">Professor</Badge>
                    
                    {/* Botão para alterar senha */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (showPasswordChange === user.id) {
                          setShowPasswordChange(null);
                          setPasswordChange({ userId: '', newPassword: '' });
                        } else {
                          setShowPasswordChange(user.id);
                          setPasswordChange({ userId: user.id, newPassword: '' });
                        }
                      }}
                      className="h-8 w-8"
                      title="Alterar senha"
                    >
                      <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(user)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  
                  {/* Campo de alteração de senha */}
                  {showPasswordChange === user.id && (
                    <div className="w-full mt-3 pt-3 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="Nova senha"
                          value={passwordChange.newPassword}
                          onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="text-sm"
                        />
                        <Button 
                          onClick={() => changeUserPassword(user.id)} 
                          size="sm"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowPasswordChange(null);
                            setPasswordChange({ userId: '', newPassword: '' });
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <UsersIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">Nenhum professor cadastrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
