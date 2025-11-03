
import React, { useState, useEffect } from 'react';
import type { Raffle } from '../types';

const RaffleApp: React.FC = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([
    {
      id: 1,
      title: "Rifa do Carro 2024",
      description: "Ganhe um carro zero quilômetro! Rifa encerra em breve.",
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      drawDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      numberPrice: 10.00,
      totalNumbers: 100,
      soldNumbers: [12, 23, 45, 67, 89, 1, 5, 18, 33, 77]
    },
    {
      id: 2,
      title: "Rifa da Viagem",
      description: "Ganhe uma viagem para Paris com tudo pago!",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      drawDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      numberPrice: 5.00,
      totalNumbers: 500,
      soldNumbers: [1, 2, 3, 100, 200, 300, 400, 499, 500]
    }
  ]);

  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<{[key: number]: any}>({});
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<any>(null);
  const [view, setView] = useState('list'); // 'list', 'selection', 'form', 'success', 'create'
  const [reservationId] = useState(Math.random().toString(36).substr(2, 9));
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [purchases, setPurchases] = useState<any[]>([]); // Simulating database storage
  const [drawTimeLeft, setDrawTimeLeft] = useState<any>(null);
  const [pixPayload, setPixPayload] = useState('');

  const [newRaffleData, setNewRaffleData] = useState({
    title: '',
    description: '',
    endDate: '',
    drawDate: '',
    numberPrice: '',
    totalNumbers: '',
  });

  // Calculate countdown for each raffle
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: {[key: number]: any} = {};
      raffles.forEach(raffle => {
        const difference = raffle.endDate.getTime() - new Date().getTime();
        if (difference > 0) {
          newTimeLeft[raffle.id] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        } else {
          newTimeLeft[raffle.id] = null;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [raffles]);

  // Payment countdown timer
  useEffect(() => {
    if (view === 'form' && !paymentTimeLeft) {
      const paymentExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const timer = setInterval(() => {
        const difference = paymentExpiration.getTime() - new Date().getTime();
        if (difference <= 0) {
          clearInterval(timer);
          setView('selection');
          setSelectedNumbers([]);
          alert('Tempo para pagamento expirado! Por favor, selecione os números novamente.');
          return;
        }
        
        setPaymentTimeLeft({
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [view, paymentTimeLeft]);

  // Draw countdown timer (after purchase)
  useEffect(() => {
    if (view === 'success' && selectedRaffle) {
      const drawDate = selectedRaffle.drawDate;
      const timer = setInterval(() => {
        const difference = drawDate.getTime() - new Date().getTime();
        if (difference <= 0) {
          clearInterval(timer);
          setDrawTimeLeft(null);
          return;
        }
        
        setDrawTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [view, selectedRaffle]);

  // Generate PIX payload when in form view
  useEffect(() => {
    if (view === 'form' && selectedNumbers.length > 0 && selectedRaffle) {
      const total = calculateTotal();
      const pixData = `00020126580014BR.GOV.BCB.PIX0136362300338790211Rifa ${selectedRaffle.id}5204000053039865405${total}5802BR5925Rifa ${selectedRaffle.title}6009SAO PAULO62190515${reservationId}63041D3F`;
      setPixPayload(pixData);
    }
  }, [view, selectedNumbers, selectedRaffle]);

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  const calculateTotal = () => {
    return (selectedNumbers.length * (selectedRaffle?.numberPrice || 0)).toFixed(2);
  };

  const handleCustomerDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData({ ...customerData, [name]: value });
  };

  const simulatePurchase = () => {
    if (!selectedRaffle) return;
    
    const purchase = {
      id: Date.now(),
      raffleId: selectedRaffle.id,
      numbers: [...selectedNumbers],
      total: calculateTotal(),
      customer: { ...customerData },
      date: new Date(),
      reservationId,
      drawDate: selectedRaffle.drawDate,
      pixPayload
    };
    
    setPurchases([...purchases, purchase]);
    
    const updatedRaffles = raffles.map(raffle => {
      if (raffle.id === selectedRaffle.id) {
        return {
          ...raffle,
          soldNumbers: [...raffle.soldNumbers, ...selectedNumbers]
        };
      }
      return raffle;
    });
    
    setRaffles(updatedRaffles);
    
    setView('success');
    
    setTimeout(() => {
      const emailContent = `
        Confirmação de Compra - Rifa ${selectedRaffle.title}
        
        Olá, ${customerData.name}!
        
        Sua compra foi confirmada com sucesso! Aqui estão os detalhes:
        
        🎫 Rifa: ${selectedRaffle.title}
        🔢 Números selecionados: ${selectedNumbers.join(', ')}
        💰 Total pago: R$${calculateTotal()}
        📅 Data da compra: ${new Date().toLocaleDateString('pt-BR')}
        🎯 Data do sorteio: ${selectedRaffle.drawDate.toLocaleDateString('pt-BR')}
        🆔 ID da reserva: ${reservationId}
        
        Chave PIX utilizada: CPF 362.300.338-79
        
        Guarde bem seus números! O sorteio será realizado em ${selectedRaffle.drawDate.toLocaleDateString('pt-BR')}.
        
        Este email serve como comprovante de sua participação.
        
        Em caso de dúvidas, entre em contato:
        suporte@rifasonline.com.br | (11) 99999-9999
        
        Obrigado por participar!
      `;
      
      alert(`✅ Email enviado com sucesso para ${customerData.email}!\n\n📧 Conteúdo do email:\n${emailContent}`);
    }, 1500);
  };

  const handleNewRaffleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRaffleData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRaffle = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, endDate, drawDate, numberPrice, totalNumbers } = newRaffleData;
    
    if (!title || !description || !endDate || !drawDate || !numberPrice || !totalNumbers) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    
    const endDateObj = new Date(endDate);
    const drawDateObj = new Date(drawDate);

    if (endDateObj >= drawDateObj) {
      alert('A data de término deve ser anterior à data do sorteio.');
      return;
    }

    if (endDateObj <= new Date()) {
      alert('A data de término deve ser no futuro.');
      return;
    }

    const newRaffle: Raffle = {
      id: Date.now(),
      title,
      description,
      endDate: endDateObj,
      drawDate: drawDateObj,
      numberPrice: parseFloat(numberPrice),
      totalNumbers: parseInt(totalNumbers, 10),
      soldNumbers: [],
    };

    setRaffles(prevRaffles => [...prevRaffles, newRaffle]);
    setView('list');
    setNewRaffleData({
      title: '',
      description: '',
      endDate: '',
      drawDate: '',
      numberPrice: '',
      totalNumbers: '',
    });
  };

  const renderRaffleList = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Rifas Online</h1>
          <p className="text-lg text-gray-600">Escolha uma rifa e participe!</p>
          <button
            onClick={() => setView('create')}
            className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Criar Nova Rifa
          </button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {raffles.map(raffle => (
            <div key={raffle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{raffle.title}</h2>
                <p className="text-gray-600 mb-4">{raffle.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Tempo Restante:</h3>
                  {timeLeft[raffle.id] ? (
                    <div className="flex justify-center space-x-2 text-sm font-mono">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatTime(timeLeft[raffle.id].days)}d
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatTime(timeLeft[raffle.id].hours)}h
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatTime(timeLeft[raffle.id].minutes)}m
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatTime(timeLeft[raffle.id].seconds)}s
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600 font-semibold">Rifa encerrada!</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-600 font-semibold text-lg">
                    R${raffle.numberPrice.toFixed(2)} por número
                  </span>
                  <span className="text-gray-500 text-sm font-medium">
                    {raffle.totalNumbers - raffle.soldNumbers.length} disponíveis
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedRaffle(raffle);
                    setView('selection');
                  }}
                  disabled={!timeLeft[raffle.id]}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    timeLeft[raffle.id]
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {timeLeft[raffle.id] ? 'Escolher Números' : 'Rifa Encerrada'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNumberSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
      {selectedRaffle && (<div className="max-w-6xl mx-auto">
        <button
          onClick={() => {
            setView('list');
            setSelectedRaffle(null);
          }}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          ← Voltar às rifas
        </button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedRaffle.title}</h1>
            <p className="text-gray-600 mb-4">{selectedRaffle.description}</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-1">Preço por número</h3>
                <p className="text-2xl font-bold text-blue-600">R${selectedRaffle.numberPrice.toFixed(2)}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="font-semibold text-green-800 mb-1">Números selecionados</h3>
                <p className="text-2xl font-bold text-green-600">{selectedNumbers.length}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-1">Total</h3>
                <p className="text-2xl font-bold text-purple-600">R${calculateTotal()}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Escolha seus números</h2>
              <p className="text-gray-600 mb-4">
                Selecione os números que deseja comprar. Números já vendidos estão desabilitados.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Tempo Restante:</h3>
                {timeLeft[selectedRaffle.id] ? (
                  <div className="flex justify-center space-x-3 text-sm font-mono">
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                      {formatTime(timeLeft[selectedRaffle.id].days)} dias
                    </div>
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                      {formatTime(timeLeft[selectedRaffle.id].hours)} horas
                    </div>
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                      {formatTime(timeLeft[selectedRaffle.id].minutes)} minutos
                    </div>
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                      {formatTime(timeLeft[selectedRaffle.id].seconds)} segundos
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 font-semibold">Rifa encerrada!</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-2 sm:gap-3 mb-8">
              {Array.from({ length: selectedRaffle.totalNumbers }, (_, i) => i + 1).map(number => {
                const isSold = selectedRaffle.soldNumbers.includes(number);
                const isSelected = selectedNumbers.includes(number);
                const isDisabled = isSold || !timeLeft[selectedRaffle.id];
                
                return (
                  <button
                    key={number}
                    onClick={() => !isDisabled && handleNumberClick(number)}
                    disabled={isDisabled}
                    className={`h-12 flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : isSold
                        ? 'bg-red-100 text-red-600 line-through cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    } ${isDisabled && !isSold ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
            
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">{selectedNumbers.length}</span> número(s) selecionado(s) • 
                    <span className="font-semibold text-green-600 ml-2">R${calculateTotal()}</span>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedNumbers([])}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Limpar Seleção
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedNumbers.length > 0) {
                        setView('form');
                      } else {
                        alert('Por favor, selecione pelo menos um número para continuar.');
                      }
                    }}
                    disabled={selectedNumbers.length === 0 || !timeLeft[selectedRaffle.id]}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                      selectedNumbers.length > 0 && timeLeft[selectedRaffle.id]
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Ir para Pagamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>)}
    </div>
  );

  const renderCustomerForm = () => {
    if(!selectedRaffle) return null;
    
    const total = calculateTotal();
    const paymentTime = paymentTimeLeft || { minutes: 10, seconds: 0 };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setView('selection');
              setPaymentTimeLeft(null);
            }}
            className="mb-6 text-emerald-700 hover:text-emerald-900 font-medium flex items-center"
          >
            ← Voltar à seleção de números
          </button>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
              <div className="bg-emerald-600 text-white p-6 text-center">
                <h1 className="text-2xl font-bold">Resumo do Pedido</h1>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Rifa:</span>
                    <span>{selectedRaffle.title}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Números selecionados:</span>
                    <span className="font-mono">{selectedNumbers.join(', ')}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Quantidade:</span>
                    <span>{selectedNumbers.length} números</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg text-lg font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-emerald-600">R${total}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-medium flex items-center justify-center">
                    <span className="mr-2">⏰</span>
                    Tempo restante para conclusão: 
                    <span className="ml-1 font-mono">{formatTime(paymentTime.minutes)}:{formatTime(paymentTime.seconds)}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
              <div className="bg-blue-600 text-white p-6 text-center">
                <h1 className="text-2xl font-bold">Pagamento via PIX</h1>
                <p className="opacity-90 mt-1">Chave: CPF 362.300.338-79</p>
              </div>
              
              <div className="p-6">
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input type="text" name="name" value={customerData.name} onChange={handleCustomerDataChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Seu nome completo" required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={customerData.email} onChange={handleCustomerDataChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="seuemail@dominio.com" required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
                    <input type="tel" name="phone" value={customerData.phone} onChange={handleCustomerDataChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="(11) 99999-9999" required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input type="text" name="cpf" value={customerData.cpf} onChange={handleCustomerDataChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="000.000.000-00" required />
                  </div>
                  
                  <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Escaneie o QR Code para Pagar</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-64 h-64 bg-white p-4 rounded-xl border border-gray-300 mb-4 flex items-center justify-center">
                        {pixPayload ? (<img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`} alt="QR Code PIX" className="w-full h-full object-contain" />) : (<div className="text-gray-500 text-sm">Gerando QR Code...</div>)}
                      </div>
                      <button type="button" onClick={() => { if (pixPayload) { navigator.clipboard.writeText(pixPayload).then(() => alert('Código PIX copiado para a área de transferência!')).catch(err => console.error('Erro ao copiar:', err)); } }} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copiar código PIX
                      </button>
                    </div>
                  </div>
                  
                  <button type="button" onClick={simulatePurchase} disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf} className={`w-full py-4 rounded-lg font-bold text-white transition-colors ${ customerData.name && customerData.email && customerData.phone && customerData.cpf ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed' }`}>
                    Confirmar Pagamento e Finalizar Compra
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessPage = () => {
    const total = calculateTotal();
    const drawDate = selectedRaffle?.drawDate?.toLocaleDateString('pt-BR');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Muito Obrigado!</h1>
            <p className="text-2xl text-green-700 font-bold">Sua compra foi concluída com sucesso!</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
            <div className="p-8">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Comprador</h3>
                <p className="font-medium">{customerData.name}</p>
                <p className="text-gray-600">{customerData.email}</p>
                <p className="text-gray-600">{customerData.phone}</p>
              </div>
              
              <div className="space-y-6 mb-8">
                 <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Rifa:</span><span className="font-semibold text-blue-700">{selectedRaffle?.title}</span></div>
                 <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Números Comprados:</span><span className="font-mono font-bold text-green-700">{selectedNumbers.join(', ')}</span></div>
                 <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Total Pago:</span><span className="font-bold text-green-600 text-2xl">R${total}</span></div>
                 <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-700">Sorteio:</span><span className="font-bold text-purple-700">{drawDate}</span></div>
              </div>
              
              {drawTimeLeft && (
                <div className="mb-8 p-5 bg-purple-50 rounded-xl border border-purple-300 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Tempo Restante para o Sorteio</h3>
                  <div className="flex justify-center space-x-4">
                    <div><div className="text-3xl font-bold text-purple-700">{formatTime(drawTimeLeft.days)}</div><div className="text-sm text-gray-600">Dias</div></div>
                    <div><div className="text-3xl font-bold text-purple-700">{formatTime(drawTimeLeft.hours)}</div><div className="text-sm text-gray-600">Horas</div></div>
                    <div><div className="text-3xl font-bold text-purple-700">{formatTime(drawTimeLeft.minutes)}</div><div className="text-sm text-gray-600">Minutos</div></div>
                    <div><div className="text-3xl font-bold text-purple-700">{formatTime(drawTimeLeft.seconds)}</div><div className="text-sm text-gray-600">Segundos</div></div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
                <button onClick={() => { setView('list'); setSelectedRaffle(null); setSelectedNumbers([]); setCustomerData({ name: '', email: '', phone: '', cpf: '' }); }} className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors">
                  Ver Outras Rifas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateRaffleForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Criar Nova Rifa</h1>
        <form onSubmit={handleCreateRaffle} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título da Rifa</label>
            <input type="text" name="title" id="title" value={newRaffleData.title} onChange={handleNewRaffleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea name="description" id="description" value={newRaffleData.description} onChange={handleNewRaffleChange} required rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Término das Vendas</label>
              <input type="datetime-local" name="endDate" id="endDate" value={newRaffleData.endDate} onChange={handleNewRaffleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="drawDate" className="block text-sm font-medium text-gray-700 mb-1">Data do Sorteio</label>
              <input type="datetime-local" name="drawDate" id="drawDate" value={newRaffleData.drawDate} onChange={handleNewRaffleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numberPrice" className="block text-sm font-medium text-gray-700 mb-1">Preço por Número (R$)</label>
              <input type="number" name="numberPrice" id="numberPrice" value={newRaffleData.numberPrice} onChange={handleNewRaffleChange} required min="0.01" step="0.01" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="totalNumbers" className="block text-sm font-medium text-gray-700 mb-1">Total de Números</label>
              <input type="number" name="totalNumbers" id="totalNumbers" value={newRaffleData.totalNumbers} onChange={handleNewRaffleChange} required min="1" step="1" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Criar Rifa</button>
          </div>
        </form>
      </div>
    </div>
  );

  switch(view) {
    case 'list': return renderRaffleList();
    case 'selection': return renderNumberSelection();
    case 'form': return renderCustomerForm();
    case 'success': return renderSuccessPage();
    case 'create': return renderCreateRaffleForm();
    default: return renderRaffleList();
  }
};

export default RaffleApp;
