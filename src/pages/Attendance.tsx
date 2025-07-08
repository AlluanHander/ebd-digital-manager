import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, saveClass, getAttendanceRecords, saveAttendance, generateId, getCurrentQuarter, getCurrentWeek } from '@/lib/supabase-storage';
import { Class, Student, AttendanceRecord } from '@/types';
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
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: boolean}>({});
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      const allClasses = await getClasses();
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
    };
    
    if (user) {
      loadClasses();
    }
  }, [user]);

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

  const addStudent = () => {
    if (!newStudentName.trim() || !selectedClass) return;

    const newStudent: Student = {
      id: generateId(),
      name: newStudentName.trim(),
      classId: selectedClass.id,
      attendance: [],
      createdAt: new Date().toISOString()
    };

    const updatedClass = {
      ...selectedClass,
      students: [...selectedClass.students, newStudent]
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    setNewStudentName('');
    setIsAddingStudent(false);
    
    toast({
      title: "Aluno adicionado",
      description: `${newStudent.name} foi adicionado à classe.`
    });
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const saveEditStudent = () => {
    if (!editingStudent || !selectedClass) return;

    const updatedClass = {
      ...selectedClass,
      students: selectedClass.students.map(s => s.id === editingStudent.id ? editingStudent : s)
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    setEditingStudent(null);
    
    toast({
      title: "Aluno atualizado",
      description: "Dados do aluno foram atualizados com sucesso."
    });
  };

  const removeStudent = (studentId: string) => {
    if (!selectedClass) return;

    const updatedClass = {
      ...selectedClass,
      students: selectedClass.students.filter(s => s.id !== studentId)
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    
    toast({
      title: "Aluno removido",
      description: "Aluno foi removido da classe."
    });
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
                  <div className="flex gap-2">
                    <Input
                      id="new-student"
                      placeholder="Nome do aluno"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                    />
                    <Button onClick={addStudent} size="icon">
                      <UserPlus className="w-4 h-4" />
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
