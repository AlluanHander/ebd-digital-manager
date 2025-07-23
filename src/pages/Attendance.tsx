import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { saveStudent, deleteStudent, getAttendanceRecords, saveAttendance, generateId, getCurrentQuarter, getCurrentWeek, saveBirthday } from '@/lib/supabase-storage';
import { Class, Student, AttendanceRecord, Birthday } from '@/types';
import { useRealtimeClasses } from '@/hooks/useRealtimeData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserPlus, Trash2, Users, Plus, Edit } from 'lucide-react';
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

export const Attendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { classes: allClasses, loading: classesLoading, refetch: refetchClasses } = useRealtimeClasses();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentBirthday, setNewStudentBirthday] = useState('');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: boolean}>({});
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  useEffect(() => {
    if (user && allClasses.length > 0) {
      if (user.type === 'professor') {
        const userClasses = allClasses.filter(c => 
          c.teacherIds.includes(user.id) || user.classIds?.includes(c.id)
        );
        setClasses(userClasses);
        if (userClasses.length > 0 && !selectedClass) {
          setSelectedClass(userClasses[0]);
        }
      } else {
        setClasses(allClasses);
        if (allClasses.length > 0 && !selectedClass) {
          setSelectedClass(allClasses[0]);
        }
      }
    }
  }, [user, allClasses]);

  useEffect(() => {
    const loadAttendanceRecords = async () => {
      if (selectedClass) {
        const today = new Date().toISOString().split('T')[0];
        const existingRecords = (await getAttendanceRecords()).filter(r => 
          r.classId === selectedClass.id && r.date === today
        );
        
        const attendanceMap: {[key: string]: boolean} = {};
        selectedClass.students.forEach(student => {
          const record = existingRecords.find(r => r.studentId === student.id);
          attendanceMap[student.id] = record?.present || false;
        });
        setAttendanceData(attendanceMap);
      }
    };
    
    loadAttendanceRecords();
  }, [selectedClass]);

  const addStudent = async () => {
    if (!newStudentName.trim() || !selectedClass) return;

    const newStudent: Student = {
      id: generateId(),
      name: newStudentName.trim(),
      classId: selectedClass.id,
      attendance: [],
      birthday: newStudentBirthday || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await saveStudent(newStudent);
      
      // Se tem aniversário, cadastrar na tabela de aniversários também
      if (newStudentBirthday) {
        const birthdayDate = new Date(newStudentBirthday);
        const birthday: Birthday = {
          id: generateId(),
          studentId: newStudent.id,
          studentName: newStudent.name,
          classId: selectedClass.id,
          date: newStudentBirthday,
          month: birthdayDate.getMonth() + 1,
          day: birthdayDate.getDate(),
          createdAt: new Date().toISOString()
        };
        await saveBirthday(birthday);
      }
      
      await refetchClasses(); // Refresh real-time data
      setNewStudentName('');
      setNewStudentBirthday('');
      setIsAddingStudent(false);
      
      toast({
        title: "Aluno adicionado",
        description: `${newStudent.name} foi adicionado à classe.`
      });
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aluno. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const saveEditStudent = async () => {
    if (!editingStudent || !selectedClass) return;

    try {
      await saveStudent(editingStudent);
      await refetchClasses(); // Refresh real-time data
      setEditingStudent(null);
      
      toast({
        title: "Aluno atualizado",
        description: "Dados do aluno foram atualizados com sucesso."
      });
    } catch (error) {
      console.error('Error editing student:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aluno. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!selectedClass) return;

    try {
      await deleteStudent(studentId);
      await refetchClasses(); // Refresh real-time data
      
      toast({
        title: "Aluno removido",
        description: "Aluno foi removido da classe."
      });
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendanceData = () => {
    if (!selectedClass) return;

    const currentQuarter = getCurrentQuarter();
    const currentWeek = getCurrentWeek();

    Object.entries(attendanceData).forEach(([studentId, present]) => {
      const attendanceRecord: AttendanceRecord = {
        id: generateId(),
        studentId,
        classId: selectedClass.id,
        date: todayDate,
        present,
        week: currentWeek,
        quarter: currentQuarter
      };

      saveAttendance(attendanceRecord);
    });

    toast({
      title: "Presença salva",
      description: `Presença de ${todayDate} foi registrada com sucesso.`
    });
  };

  const getTodayAttendanceCount = () => {
    return Object.values(attendanceData).filter(Boolean).length;
  };

  const getTotalStudents = () => {
    return selectedClass?.students.length || 0;
  };

  if (classesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados em tempo real...</p>
        </div>
      </div>
    );
  }

  if (user?.type === 'secretario') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Presença Geral</h1>
          <p className="text-gray-600">Visão geral da presença de todas as classes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classData) => {
            // Note: For simplicity, using 0 for attendance records in overview
            const todayRecords: any[] = [];
            
            return (
              <Card key={classData.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {classData.name}
                  </CardTitle>
                  <CardDescription>
                    Professores: {classData.teacherNames.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de Alunos:</span>
                      <Badge variant="outline">{classData.students.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Presentes Hoje:</span>
                      <Badge variant="default">{todayRecords.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Presença:</span>
                      <Badge variant={classData.students.length > 0 && (todayRecords.length / classData.students.length) > 0.7 ? "default" : "secondary"}>
                        {classData.students.length > 0 ? Math.round((todayRecords.length / classData.students.length) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Presença</h1>
        <p className="text-gray-600">Gerencie alunos e registre a presença da sua classe</p>
      </div>

      {selectedClass ? (
        <div className="space-y-6">
          {/* Add Student Button */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Gerenciar Alunos
                </CardTitle>
                <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Aluno
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                      <DialogDescription>
                        Adicione um novo aluno à classe {selectedClass.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-name">Nome do Aluno</Label>
                        <Input
                          id="student-name"
                          placeholder="Digite o nome do aluno"
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="student-birthday">Data de Aniversário (opcional)</Label>
                        <Input
                          id="student-birthday"
                          type="date"
                          value={newStudentBirthday}
                          onChange={(e) => setNewStudentBirthday(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingStudent(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addStudent}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Aluno
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações da Classe */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {selectedClass.name}
                </CardTitle>
                <CardDescription>
                  Data: {new Date(todayDate).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Total de Alunos:</span>
                  <Badge variant="outline">{getTotalStudents()}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Presentes Hoje:</span>
                  <Badge variant="default">{getTodayAttendanceCount()}</Badge>
                </div>
                
                {/* Adicionar Novo Aluno */}
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="new-student" className="text-sm font-medium">
                    Adicionar Novo Aluno
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="new-student"
                      placeholder="Nome do aluno"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                    />
                    <Input
                      type="date"
                      placeholder="Aniversário (opcional)"
                      value={newStudentBirthday}
                      onChange={(e) => setNewStudentBirthday(e.target.value)}
                    />
                    <Button onClick={addStudent} className="w-full">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Aluno
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Alunos e Presença */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Lista de Presença
                </CardTitle>
                <CardDescription>
                  Marque os alunos presentes na aula de hoje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClass.students.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedClass.students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={attendanceData[student.id] || false}
                              onCheckedChange={() => toggleAttendance(student.id)}
                            />
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editStudent(student)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeStudent(student.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button onClick={saveAttendanceData} className="w-full">
                        Salvar Presença do Dia
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum aluno cadastrado</p>
                    <p className="text-sm text-gray-400">Adicione o primeiro aluno para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Student Dialog */}
          <Dialog open={editingStudent !== null} onOpenChange={(open) => !open && setEditingStudent(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Aluno</DialogTitle>
                <DialogDescription>
                  Edite as informações do aluno
                </DialogDescription>
              </DialogHeader>
              {editingStudent && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-student-name">Nome do Aluno</Label>
                    <Input
                      id="edit-student-name"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingStudent(null)}>
                  Cancelar
                </Button>
                <Button onClick={saveEditStudent}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma classe atribuída</p>
            <p className="text-sm text-gray-400">Entre em contato com o secretário para ser atribuído a uma classe</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
