"use client";

import { useEffect, useState } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { trpc } from '@/trpc/react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Star, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leads() {
  const { data, isLoading, error, refetch } = trpc.lead.getLeads.useQuery();
  const { setLeads, setLoading, setError } = useLeads();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  useEffect(() => {
    if (data) {
      setLeads(data);
    }
  }, [data, setLeads]);

  const { leads } = useLeads();

  // Calculate statistics
  const stats = {
    total: leads.length,
    highScore: leads.filter(lead => (lead.score || 0) >= 8).length,
    mediumScore: leads.filter(lead => (lead.score || 0) >= 6 && (lead.score || 0) < 8).length,
    lowScore: leads.filter(lead => (lead.score || 0) < 6).length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    newLeads: leads.filter(lead => lead.status === 'new').length,
    avgScore: leads.length > 0 ? (leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length).toFixed(1) : '0',
  };

  // Enhanced columns with score breakdown modal
  const enhancedColumns = columns.map(column => {
    if (column.accessorKey === 'score') {
      return {
        ...column,
        cell: ({ row }: any) => {
          const score = row.getValue('score') as number | null;
          const lead = row.original;
          
          return (
            <div className="flex items-center gap-2">
              <Badge className={`${
                !score ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                score >= 8 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                score >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                score >= 4 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {score ? `${score}/10` : 'N/A'}
              </Badge>
              {lead.scoreBreakdown && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowScoreModal(true);
                  }}
                  title="View score breakdown"
                >
                  <Star className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        },
      };
    }
    return column;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load leads: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track your leads with AI-powered scoring and automation
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newLeads} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}/10</div>
            <p className="text-xs text-muted-foreground">
              {stats.highScore} high-quality leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Score Leads</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highScore}</div>
            <p className="text-xs text-muted-foreground">
              Score 8+ (priority leads)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.contacted / stats.total) * 100 || 0).toFixed(1)}% contact rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Distribution</CardTitle>
          <CardDescription>
            Lead quality breakdown based on AI scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">High Quality (8-10)</span>
              </div>
              <Badge variant="secondary">{stats.highScore}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm font-medium">Medium Quality (6-7)</span>
              </div>
              <Badge variant="secondary">{stats.mediumScore}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm font-medium">Low Quality (1-5)</span>
              </div>
              <Badge variant="secondary">{stats.lowScore}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Leads ({stats.total})</TabsTrigger>
          <TabsTrigger value="high-score">High Score ({stats.highScore})</TabsTrigger>
          <TabsTrigger value="new">New ({stats.newLeads})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({stats.contacted})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                Complete list of all leads with AI scoring and status tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={enhancedColumns} data={leads} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-score" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Score Leads</CardTitle>
              <CardDescription>
                Priority leads with scores of 8 or higher - these are your best prospects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={enhancedColumns} 
                data={leads.filter(lead => (lead.score || 0) >= 8)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Leads</CardTitle>
              <CardDescription>
                Recently received leads that haven't been contacted yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={enhancedColumns} 
                data={leads.filter(lead => lead.status === 'new')} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacted Leads</CardTitle>
              <CardDescription>
                Leads that have been contacted and are in the follow-up process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={enhancedColumns} 
                data={leads.filter(lead => lead.status === 'contacted')} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {leads.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Your leads will appear here once you start receiving form submissions through your webhooks. 
              Make sure your webhooks are properly configured and active.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.href = '/webhooks'}>
                Configure Webhooks
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/agents'}>
                Setup Agents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        leadName={selectedLead?.name || ''}
        scoreBreakdown={selectedLead?.scoreBreakdown ? JSON.parse(selectedLead.scoreBreakdown) : null}
      />
    </div>
  );
}