'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Calendar, 
  GraduationCap, 
  Trophy, 
  Target, 
  BookOpen,
  Settings,
  Edit,
  Upload
} from 'lucide-react';
import useSWR from 'swr';
import { User as UserType } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { data: user, error, mutate } = useSWR<UserType>('/api/user', fetcher);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserType>>({});

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updatedUser = await response.json();
      mutate(updatedUser);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleInputChange = (field: keyof UserType, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (error) return <div>Failed to load user data.</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and track your progress</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.name?.split(" ").map((n) => n[0]).join("")}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" className="hidden" />
                </label>
              </div>
              <CardTitle className="text-xl mt-4">{profileData.name}</CardTitle>
              <CardDescription>{profileData.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span>PTE Student</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Member since January 2024</span>
                </div>
                <div className="text-sm text-gray-500">Last active: Today</div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" className="flex-1">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
              <CardDescription>Your PTE preparation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">8</div>
                  <div className="text-sm text-gray-500">Tests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">42h</div>
                  <div className="text-sm text-gray-500">Practice Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">A</div>
                  <div className="text-sm text-gray-500">Current Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Target Score
              </CardTitle>
              <CardDescription>Track your progress toward your goal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold">75/90</div>
                    <div className="text-gray-500">Current Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">+15</div>
                    <div className="text-gray-500">To Target</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75/90</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${(75 / 90) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={profileData.targetScore || 79}
                    onChange={(e) => handleInputChange('targetScore', e.target.value)}
                    disabled={!isEditing}
                    type="number"
                    min="10"
                    max="90"
                    className="w-32"
                  />
                  <Button disabled={!isEditing} onClick={handleSave}>
                    Update Target
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={'PTE Student'}
                  disabled={true}
                />
              </div>
              
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  value={'January 2024'}
                  disabled={true}
                />
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex justify-end mt-6">
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your PTE learning milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="font-medium">Perfect Score</div>
              <div className="text-sm text-gray-500">Scored 90/90 on Reading</div>
              <Badge variant="secondary" className="mt-2">Completed</Badge>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="font-medium">Target Achieved</div>
              <div className="text-sm text-gray-500">Reached 75 score</div>
              <Badge variant="secondary" className="mt-2">Completed</Badge>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-medium">10 Mock Tests</div>
              <div className="text-sm text-gray-500">Completed 10 practice tests</div>
              <Badge variant="outline" className="mt-2">In Progress</Badge>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="font-medium">30-Day Streak</div>
              <div className="text-sm text-gray-500">Study for 30 days</div>
              <Badge variant="outline" className="mt-2">In Progress</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}