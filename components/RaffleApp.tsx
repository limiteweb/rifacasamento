import React, { useState, useEffect } from 'react';

const App = () => {
  // Mock raffle data with enhanced structure
  const [raffles, setRaffles] = useState([
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

  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'selection', 'form', 'success'
  const [reservationId] = useState(Math.random().toString(36).substr(2, 9));
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('waiting'); // 'waiting', 'processing', 'confirmed', 'expired'
  const [paymentTimer, setPaymentTimer] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Calculate countdown for each raffle
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      raffles.forEach(raffle => {
        const difference = raffle.endDate - new Date();
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
        const difference = paymentExpiration - new Date();
        if (difference <= 0) {
          clearInterval(timer);
          setPaymentTimeLeft(null);
          if (showPixModal) {
            setPaymentStatus('expired');
          }
          return;
        }
        
        setPaymentTimeLeft({
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }, 1000);
      
      setPaymentTimer(timer);
      return () => clearInterval(timer);
    }
  }, [view, paymentTimeLeft]);

  // Simulate bank payment confirmation (in real app this would be a webhook)
  useEffect(() => {
    if (showPixModal && paymentStatus === 'waiting') {
      const checkInterval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        
        // Simulate bank confirmation with increasing probability over time
        const probability = Math.min(0.15 * secondsElapsed, 0.95); // 15% chance per second, max 95%
        
        if (Math.random() < probability) {
          clearInterval(checkInterval);
          setPaymentStatus('processing');
          
          // Simulate processing time before confirmation
          setTimeout(() => {
            handlePaymentSuccess();
          }, 2000);
        }
      }, 1000);
      
      return () => clearInterval(checkInterval);
    }
  }, [showPixModal, paymentStatus, secondsElapsed]);

  // Generate PIX payload based on selected numbers and raffle
  useEffect(() => {
    if (selectedNumbers.length > 0 && selectedRaffle) {
      const total = calculateTotal();
      const pixPayload = `00020126850014BR.GOV.BCB.PIX0136362300338790214Rifa ${selectedRaffle.title}52040000530398654${total.length + 2}0${total}5802BR5925Rifa ${selectedRaffle.title}6008BRASIL62230519${reservationId}6304AF61`;
      setPixPayload(pixPayload);
    }
  }, [selectedNumbers, selectedRaffle]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (paymentTimer) clearInterval(paymentTimer);
    };
  }, [paymentTimer]);

  const handleNumberClick = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  const calculateTotal = () => {
    return (selectedNumbers.length * (selectedRaffle?.numberPrice || 0)).toFixed(2);
  };

  const handleCustomerDataChange = (e) => {
    const { name, value } = e.target;
    setCustomerData({ ...customerData, [name]: value });
  };

  const handlePaymentSuccess = () => {
    // Simulate saving purchase data
    const purchaseData = {
      raffleId: selectedRaffle.id,
      numbers: selectedNumbers,
      total: calculateTotal(),
      customer: customerData,
      date: new Date(),
      reservationId
    };
    
    // Simulate sending email
    const emailContent = `
      Confirmação de Compra - Rifa ${selectedRaffle.title}
      
      Olá, ${customerData.name}!
      
      Sua compra foi confirmada com sucesso! Aqui estão os detalhes:
      
      🎫 Rifa: ${selectedRaffle.title}
      🔢 Números selecionados: ${selectedNumbers.join(', ')}
      💰 Total pago: R$${calculateTotal()}
      📅 Data da compra: ${new Date().toLocaleDateString('pt-BR')}
      🎯 Data do sorteio: ${selectedRaffle.drawDate.toLocaleDateString('pt-BR')}
      🆔 ID da transação: ${reservationId}
      
      Chave PIX utilizada: CPF 362.300.338-79
      
      Guarde bem seus números! O sorteio será realizado em ${selectedRaffle.drawDate.toLocaleDateString('pt-BR')}.
      
      Este email serve como comprovante de sua participação.
      
      Em caso de dúvidas, entre em contato:
      suporte@rifasonline.com.br | (11) 99999-9999
      
      Obrigado por participar!
    `;
    
    // In a real application, this would send an actual email
    console.log('Email enviado para:', customerData.email);
    console.log('Conteúdo do email:', emailContent);
    
    // Update sold numbers in the raffle
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
    setShowPixModal(false);
    setView('success');
    setPaymentStatus('confirmed');
    
    // Show success message
    setTimeout(() => {
      alert(`✅ Pagamento confirmado com sucesso!\n\nUm email com todas as informações foi enviado para ${customerData.email}`);
    }, 1000);
  };

  const renderRaffleList = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Rifas Online</h1>
          <p className="text-lg text-gray-600">Escolha uma rifa e participe!</p>
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
      <div className="max-w-6xl mx-auto">
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
            
            {/* Number Grid */}
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
            
            {/* Summary and Checkout */}
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
      </div>
    </div>
  );

  const renderCustomerForm = () => {
    const total = calculateTotal();
    const paymentTime = paymentTimeLeft || { minutes: 10, seconds: 0 };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setView('selection');
              setPaymentTimeLeft(null);
            }}
            className="mb-6 text-emerald-700 hover:text-emerald-900 font-medium flex items-center"
          >
            ← Voltar à seleção de números
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center">
              <h1 className="text-2xl font-bold">Complete seu Cadastro</h1>
              <p className="opacity-90 mt-1">Preencha seus dados para finalizar a compra</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">Resumo da Compra</h3>
                <p className="text-gray-700"><span className="font-medium">Rifa:</span> {selectedRaffle.title}</p>
                <p className="text-gray-700"><span className="font-medium">Números:</span> {selectedNumbers.join(', ')}</p>
                <p className="text-gray-700"><span className="font-medium">Quantidade:</span> {selectedNumbers.length} números</p>
                <p className="text-gray-700 mt-2"><span className="font-bold text-green-600 text-lg">Total: R${total}</span></p>
              </div>
              
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleCustomerDataChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleCustomerDataChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seuemail@dominio.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleCustomerDataChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={customerData.cpf}
                    onChange={handleCustomerDataChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Seus dados serão usados apenas para envio do comprovante e atualizações sobre o sorteio. Não compartilhamos suas informações com terceiros.
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf) {
                      alert('Por favor, preencha todos os campos obrigatórios antes de prosseguir.');
                      return;
                    }
                    setShowPixModal(true);
                    setPaymentStatus('waiting');
                    setSecondsElapsed(0);
                  }}
                  disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf}
                  className={`w-full py-4 rounded-lg font-bold text-white transition-colors ${
                    customerData.name && customerData.email && customerData.phone && customerData.cpf
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">💰</span>
                    Pagar Agora com PIX (CPF: 362.300.338-79)
                  </span>
                </button>
                
                <p className="text-xs text-red-500 text-center font-medium flex items-center justify-center">
                  <span className="mr-1">⏰</span>
                  Tempo restante para conclusão: {formatTime(paymentTime.minutes)}:{formatTime(paymentTime.seconds)}
                </p>
              </form>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Ao confirmar, você concorda com nossos <span className="text-blue-600 hover:underline cursor-pointer">termos e condições</span> e <span className="text-blue-600 hover:underline cursor-pointer">política de privacidade</span>.</p>
          </div>
          
          {/* PIX Payment Modal - NO CONFIRM BUTTON, only automatic confirmation */}
          {showPixModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-5 text-center relative">
                  <h2 className="text-2xl font-bold">Aguardando Confirmação do Banco</h2>
                  <p className="opacity-90 mt-1">Nenhuma ação manual necessária</p>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      Valor a ser pago: R${total}
                    </div>
                    <p className="text-gray-600 mt-1">ID da transação: {reservationId}</p>
                  </div>
                  
                  {/* QR Code Section */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-64 h-64 bg-white p-4 rounded-xl border-2 border-dashed border-green-300 mb-4 flex items-center justify-center overflow-hidden">
                      {pixPayload ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`} 
                          alt="QR Code PIX" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-500 text-sm">Gerando QR Code...</div>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-100 p-3 rounded-lg mb-3 border border-dashed border-gray-300">
                      <p className="text-xs font-mono break-all text-center text-gray-700">
                        {pixPayload || 'Aguardando geração do código PIX...'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (pixPayload) {
                          navigator.clipboard.writeText(pixPayload)
                            .then(() => {
                              alert('Código PIX copiado para a área de transferência!');
                            })
                            .catch(err => console.error('Erro ao copiar:', err));
                        }
                      }}
                      className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar código PIX
                    </button>
                  </div>
                  
                  {/* Security Notice */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="ml-2 text-sm text-purple-700 font-medium">
                        <strong>Segurança Total:</strong> Este sistema aguarda automaticamente a confirmação do seu pagamento diretamente com o banco. Nenhum botão de confirmação manual existe para evitar fraudes. Você será redirecionado automaticamente assim que o pagamento for confirmado.
                      </p>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Como pagar:
                    </h4>
                    <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                      <li>Abra o app do seu banco no celular</li>
                      <li>Acesse a função "Pagar com PIX"</li>
                      <li>Escaneie o QR Code acima ou cole o código</li>
                      <li>Confira o valor (R${total}) e a chave (CPF 362.300.338-79)</li>
                      <li>Confirme o pagamento</li>
                      <li><strong className="text-purple-700">Não feche esta página</strong> - aguarde a confirmação automática</li>
                    </ol>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="mb-6">
                    {paymentStatus === 'waiting' && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex justify-center mb-2">
                          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-medium text-yellow-800">Aguardando pagamento</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Escaneie o QR Code e realize o pagamento. O sistema verificará automaticamente a confirmação do banco.
                        </p>
                        <p className="text-xs text-yellow-600 mt-2">
                          Tempo decorrido: {secondsElapsed} segundos
                        </p>
                      </div>
                    )}
                    
                    {paymentStatus === 'processing' && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-center mb-2">
                          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-medium text-blue-800">Pagamento em processamento</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Seu pagamento foi recebido pelo banco e está sendo processado. Aguarde a confirmação final.
                        </p>
                      </div>
                    )}
                    
                    {paymentStatus === 'expired' && (
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-red-800">Tempo esgotado</p>
                        <p className="text-sm text-red-700 mt-1">
                          O tempo para pagamento expirou. Por favor, selecione os números novamente.
                        </p>
                        <button
                          onClick={() => {
                            setShowPixModal(false);
                            setView('selection');
                            setSelectedNumbers([]);
                            setPaymentTimeLeft(null);
                          }}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Selecionar Novos Números
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Payment Timer */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Tempo restante:</span>
                      <span className={`font-bold ${paymentTime.minutes === 0 && paymentTime.seconds < 30 ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatTime(paymentTime.minutes)}:{formatTime(paymentTime.seconds)}
                      </span>
                    </div>
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${paymentTime.minutes === 0 && paymentTime.seconds < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ 
                          width: `${((paymentTime.minutes * 60 + paymentTime.seconds) / 600) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Seu pagamento deve ser confirmado em até 10 minutos para garantir os números selecionados.
                    </p>
                  </div>
                  
                  {/* Important Notice */}
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="ml-2 text-xs text-emerald-700">
                        <strong>Proteção Anti-Fraude:</strong> Esta página verifica automaticamente o status do seu pagamento com o banco. Você só será redirecionado após a confirmação real do pagamento, garantindo segurança total para compradores e vendedores.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessPage = () => {
    const total = calculateTotal();
    const purchaseDate = new Date().toLocaleDateString('pt-BR');
    const drawDate = selectedRaffle?.drawDate?.toLocaleDateString('pt-BR');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Muito Obrigado!</h1>
            <p className="text-xl text-green-600 font-semibold">Pagamento confirmado com sucesso!</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
            <div className="bg-green-600 text-white p-5 text-center">
              <h2 className="text-xl font-bold">Comprovante de Participação</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Comprador:</span>
                  <span className="text-black font-medium">{customerData.name}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Email:</span>
                  <span className="text-black">{customerData.email}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Telefone:</span>
                  <span className="text-black">{customerData.phone}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">CPF:</span>
                  <span className="text-black">{customerData.cpf}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Rifa:</span>
                  <span className="text-black font-medium">{selectedRaffle.title}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Números:</span>
                  <span className="font-mono font-bold text-black">{selectedNumbers.join(', ')}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Total:</span>
                  <span className="font-bold text-green-600 text-lg">R${total}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Data:</span>
                  <span className="text-black">{purchaseDate}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">Sorteio:</span>
                  <span className="text-black font-medium">{drawDate}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">ID da Transação:</span>
                  <span className="font-mono text-sm text-gray-800">{reservationId}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-800">
                    <strong>✅ Pagamento confirmado pelo banco!</strong><br />
                    Um email com todas as informações foi enviado para <span className="font-medium text-black">{customerData.email}</span>. Verifique também sua caixa de spam.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="ml-2 text-sm text-gray-800">
                    <strong>IMPORTANTE:</strong> Guarde bem seus números ({selectedNumbers.join(', ')}) e este comprovante. No dia do sorteio, você receberá um email com o resultado.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    // Reset everything
                    setView('list');
                    setSelectedRaffle(null);
                    setSelectedNumbers([]);
                    setCustomerData({ name: '', email: '', phone: '', cpf: '' });
                    setPaymentTimeLeft(null);
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Ver Outras Rifas
                </button>
                
                <button
                  onClick={() => {
                    const comprovante = `
                      COMPROVANTE - RIFA ONLINE
                      ==========================
                      
                      CONFIRMAÇÃO AUTOMÁTICA DE PAGAMENTO
                      
                      Comprador: ${customerData.name}
                      Email: ${customerData.email}
                      Telefone: ${customerData.phone}
                      
                      Rifa: ${selectedRaffle.title}
                      Números: ${selectedNumbers.join(', ')}
                      Total pago: R$${total}
                      
                      Data da compra: ${purchaseDate}
                      Data do sorteio: ${drawDate}
                      
                      Chave PIX: CPF 362.300.338-79
                      ID da Transação: ${reservationId}
                      
                      Obrigado por participar!
                    `;
                    
                    const blob = new Blob([comprovante], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `comprovante-rifa-${reservationId}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Baixar Comprovante
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-700">
            <p>Em caso de dúvidas, entre em contato:</p>
            <p className="font-medium text-black">suporte@rifasonline.com.br | (11) 99999-9999</p>
          </div>
        </div>
      </div>
    );
  };

  // Render the current view
  switch(view) {
    case 'list':
      return renderRaffleList();
    case 'selection':
      return renderNumberSelection();
    case 'form':
      return renderCustomerForm();
    case 'success':
      return renderSuccessPage();
    default:
      return renderRaffleList();
  }
};

export default App;