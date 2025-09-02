import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaCalendarAlt, FaGamepad, FaSearch, FaFilter } from 'react-icons/fa';
import './styles/tournaments.css';

interface Tournament {
  id: string;
  name: string;
  game: string;
  participants: number;
  maxParticipants: number;
  prizePool: string;
  startDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API fetch
    const fetchTournaments = async () => {
      try {
        // Replace with actual API call
        const mockTournaments: Tournament[] = [
          {
            id: '1',
            name: 'Epic Showdown',
            game: 'Valorant',
            participants: 42,
            maxParticipants: 64,
            prizePool: '$25,000',
            startDate: '2023-12-15T19:00:00',
            status: 'upcoming',
            image: 'https://via.placeholder.com/400x200/1a1a2e/0f3460?text=Valorant'
          },
          {
            id: '2',
            name: 'CS:GO Masters',
            game: 'CS:GO',
            participants: 28,
            maxParticipants: 32,
            prizePool: '$15,000',
            startDate: '2023-12-10T15:30:00',
            status: 'ongoing',
            image: 'https://via.placeholder.com/400x200/16213e/0f3460?text=CSGO'
          },
          {
            id: '3',
            name: 'League of Legends Championship',
            game: 'League of Legends',
            participants: 16,
            maxParticipants: 16,
            prizePool: '$50,000',
            startDate: '2023-11-30T18:00:00',
            status: 'completed',
            image: 'https://via.placeholder.com/400x200/1f1d36/3f3351?text=LoL'
          },
          {
            id: '4',
            name: 'DOTA 2 Invitational',
            game: 'DOTA 2',
            participants: 12,
            maxParticipants: 16,
            prizePool: '$35,000',
            startDate: '2023-12-20T20:00:00',
            status: 'upcoming',
            image: 'https://via.placeholder.com/400x200/1a1a2e/0f3460?text=DOTA2'
          },
        ];
        setTournaments(mockTournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tournament.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || tournament.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      upcoming: 'bg-amber-500/20 text-amber-400',
      ongoing: 'bg-emerald-500/20 text-emerald-400',
      completed: 'bg-blue-500/20 text-blue-400'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Tournaments
            </h1>
            <p className="text-gray-400 mt-2">Compete in the most exciting gaming tournaments</p>
          </div>
          <button 
            onClick={() => navigate('/tournaments/create')}
            className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Create Tournament
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tournaments..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="appearance-none pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Tournaments</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative">
                <img 
                  src={tournament.image} 
                  alt={tournament.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(tournament.status)}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-600/80 rounded-lg backdrop-blur-sm">
                      <FaGamepad className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded">
                      {tournament.game}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">{tournament.name}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaUsers />
                    <span className="text-sm">
                      {tournament.participants}/{tournament.maxParticipants} Players
                    </span>
                  </div>
                  <div className="text-yellow-400 font-bold">
                    {tournament.prizePool}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                  <FaCalendarAlt />
                  <span>{new Date(tournament.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ 
                      width: `${(tournament.participants / tournament.maxParticipants) * 100}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mb-4">
                  <span>{tournament.participants} Registered</span>
                  <span>{tournament.maxParticipants - tournament.participants} Spots Left</span>
                </div>

                <button 
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {tournament.status === 'upcoming' ? 'Register Now' : 'View Details'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No tournaments found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
