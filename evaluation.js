// Don't create a loading indicator here - resource-loader.js handles this
// Just make sure main content is hidden until fully loaded
const main = document.querySelector('main');
if (main) {
    main.style.visibility = 'hidden';
}

// Determine current language
function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    // Return uppercase language codes to match language-picker.js
    // but use case-insensitive detection for reliability
    return currentPath.toLowerCase().includes('_es-mx') ? 'es-MX' : 'en-US';
}

// Hardcoded fallback strings in case JSON loading fails
const fallbackStrings = {
    "en-us": {
        "dimensions": {
            "language": "Language, Culture & Communication",
            "research": "Research & Critical Thinking",
            "market": "Market Awareness",
            "subject": "Subject Matter Expertise",
            "gilt": "GILT",
            "technology": "Technology",
            "management": "Management"
        },
        "ui": {
            "calculateBtn": "Calculate Results",
            "evalTitle": "Self-Evaluation",
            "evalDesc": "Rate your competency level in each area on a scale of 1-5, where:",
            "resultsTitle": "Your Localization Competency Results"
            // Add more fallback strings as needed
        },
        "alerts": {
            "incomplete": "Please complete all ratings before calculating your results."
        }
    },
    "es-mx": {
        "dimensions": {
            "language": "Idioma, Cultura y Comunicación",
            "research": "Investigación y Pensamiento Crítico",
            "market": "Conocimiento del Mercado",
            "subject": "Conocimiento de la Materia",
            "gilt": "GILT",
            "technology": "Tecnología",
            "management": "Gestión"
        },
        "ui": {
            "calculateBtn": "Calcular Resultados",
            "evalTitle": "Autoevaluación",
            "evalDesc": "Califique su nivel de competencia en cada área en una escala de 1 a 5, donde:",
            "resultsTitle": "Sus Resultados de Competencia en Localización"
            // Add more fallback strings as needed
        },
        "alerts": {
            "incomplete": "Por favor, complete todas las calificaciones antes de calcular sus resultados."
        }
    }
};

// Function to safely get nested properties
function getNestedProperty(obj, path) {
    if (!obj) return undefined;
    const properties = path.split('.');
    return properties.reduce((prev, curr) => 
        prev && prev[curr] ? prev[curr] : undefined, obj);
}

// Helper function to safely update an element
function safelyUpdateElement(id, text, property = 'textContent') {
    const element = document.getElementById(id);
    if (element) {
        if (property === 'textContent') {
            element.textContent = text;
        } else if (property === 'innerHTML') {
            element.innerHTML = text;
        }
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// === SHARED DIMENSION STRUCTURE - SINGLE SOURCE OF TRUTH ===
// Define dimension structure globally to ensure consistency across the application
function createDimensionStructure(strings) {
    return {
        'language': {
            name: getNestedProperty(strings, 'dimensions.language') || 'Language, Culture & Communication',
            competencies: ['multilingual', 'cultural', 'communication']
        },
        'research': {
            name: getNestedProperty(strings, 'dimensions.research') || 'Research & Critical Thinking',
            competencies: ['analytical', 'research-skills', 'evaluation-skills']
        },
        'market': {
            name: getNestedProperty(strings, 'dimensions.market') || 'Market Awareness',
            competencies: ['source-market', 'target-market', 'marketplace', 'industry-knowledge']
        },
        'subject': {
            name: getNestedProperty(strings, 'dimensions.subject') || 'Subject Matter Expertise',
            competencies: ['specialization', 'legal', 'data-security']
        },
        'gilt': {
            name: getNestedProperty(strings, 'dimensions.gilt') || 'GILT',
            competencies: ['translation', 'localization', 'internationalization', 'globalization']
        },
        'technology': {
            name: getNestedProperty(strings, 'dimensions.technology') || 'Technology',
            competencies: ['general-tech', 'cat-tools', 'mt', 'web-dev', 'dtp', 'software', 'gai']
        },
        'management': {
            name: getNestedProperty(strings, 'dimensions.management') || 'Management',
            competencies: ['stakeholder', 'account', 'project', 'quality', 'operations']
        }
    };
}

// Build the evaluation section from JSON content
function buildEvaluationSection(strings) {
    console.log("Building evaluation section with strings:", strings);
    const evaluationSection = document.getElementById('evaluation');
    if (!evaluationSection) {
        console.error("Cannot find 'evaluation' element");
        return;
    }
    
    evaluationSection.innerHTML = ''; // Clear any existing content
    
    // Create section title
    const evalTitle = document.createElement('h2');
    evalTitle.id = 'eval-title';
    evalTitle.textContent = strings.ui?.evalTitle || 'Self-Evaluation';
    evaluationSection.appendChild(evalTitle);
    
    // Create evaluation description
    const evalDesc = document.createElement('p');
    evalDesc.id = 'eval-desc';
    evalDesc.textContent = strings.ui?.evalDesc || 'Rate your competency level in each area on a scale of 1-5, where:';
    evaluationSection.appendChild(evalDesc);
    
    // Create rating scale
    const ratingScale = document.createElement('ul');
    ratingScale.className = 'rating-scale';
    
    // Add scale labels
    if (strings.ui?.scaleLabels) {
        for (let i = 1; i <= 5; i++) {
            const scaleItem = document.createElement('li');
            scaleItem.id = 'scale-' + i;
            scaleItem.innerHTML = `<strong>${i}</strong> - ${strings.ui.scaleLabels[i]}`;
            ratingScale.appendChild(scaleItem);
        }
    } else {
        // Fallback scale labels
        const fallbackLabels = [
            'Novice (No experience or basic awareness)',
            'Beginner (Limited experience, require guidance)',
            'Intermediate (Working knowledge, some independence)',
            'Advanced (Comprehensive knowledge, work independently)',
            'Expert (Deep expertise, can teach others)'
        ];
        
        for (let i = 1; i <= 5; i++) {
            const scaleItem = document.createElement('li');
            scaleItem.id = 'scale-' + i;
            scaleItem.innerHTML = `<strong>${i}</strong> - ${fallbackLabels[i-1]}`;
            ratingScale.appendChild(scaleItem);
        }
    }
    
    evaluationSection.appendChild(ratingScale);
    
    // Create form for competency ratings
    const evalForm = document.createElement('form');
    evalForm.id = 'evaluation-form';
    
    // Use the shared dimension structure
    const dimensionStructure = createDimensionStructure(strings);
    
    // Create each dimension section in the form
    for (const dimKey in dimensionStructure) {
        const dimension = dimensionStructure[dimKey];
        
        // Create section for this dimension
        const dimSection = document.createElement('div');
        dimSection.className = 'eval-section';
        
        // Create section title
        const dimTitle = document.createElement('h3');
        dimTitle.id = dimKey + '-title';
        dimTitle.textContent = dimension.name;
        dimSection.appendChild(dimTitle);
        
        // Create competencies for this dimension
        for (const compKey of dimension.competencies) {
            const compDiv = document.createElement('div');
            compDiv.className = 'competency';
            
            // Create label
            const compLabel = document.createElement('label');
            compLabel.id = 'label-' + compKey;
            compLabel.textContent = strings.competencyLabels?.[compKey] || capitalizeFirstLetter(compKey.replace('-', ' ')) + ':';
            compDiv.appendChild(compLabel);
            
            // Create rating options
            const ratingDiv = document.createElement('div');
            ratingDiv.className = 'rating';
            
            for (let i = 1; i <= 5; i++) {
                // Create radio input
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = compKey;
                radioInput.id = `${compKey}-${i}`;
                radioInput.value = i;
                
                // Create label for radio
                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `${compKey}-${i}`;
                radioLabel.textContent = i;
                
                // Add to rating div
                ratingDiv.appendChild(radioInput);
                ratingDiv.appendChild(radioLabel);
            }
            
            compDiv.appendChild(ratingDiv);
            dimSection.appendChild(compDiv);
        }
        
        evalForm.appendChild(dimSection);
    }
    
    // Create submit button area
    const submitArea = document.createElement('div');
    submitArea.className = 'submit-area';
    
    const calculateBtn = document.createElement('button');
    calculateBtn.type = 'button';
    calculateBtn.id = 'calculate-btn';
    calculateBtn.textContent = strings.ui?.calculateBtn || 'Calculate Results';
    
    submitArea.appendChild(calculateBtn);
    evalForm.appendChild(submitArea);
    evaluationSection.appendChild(evalForm);
    
    // Make section visible
    evaluationSection.classList.remove('hidden');
}

// Build the results section from JSON content
function buildResultsSection(strings) {
    console.log("Building results section with strings:", strings);
    const resultsSection = document.getElementById('results');
    if (!resultsSection) {
        console.error("Cannot find 'results' element");
        return;
    }
    
    resultsSection.innerHTML = ''; // Clear any existing content
    
    // Create results title
    const resultsTitle = document.createElement('h2');
    resultsTitle.id = 'results-title';
    resultsTitle.textContent = strings.ui?.resultsTitle || 'Your Localization Competency Results';
    resultsSection.appendChild(resultsTitle);
    
    // Create results intro text
    const resultsIntro = document.createElement('p');
    resultsIntro.id = 'results-intro';
    resultsIntro.textContent = strings.ui?.resultsIntro || 'Here\'s an overview of your strengths and areas for development across the seven LMCC dimensions:';
    resultsSection.appendChild(resultsIntro);
    
    // Create chart section
    const chartSection = document.createElement('div');
    chartSection.className = 'results-chart';
    
    const resultsChart = document.createElement('canvas');
    resultsChart.id = 'results-chart';
    
    chartSection.appendChild(resultsChart);
    resultsSection.appendChild(chartSection);
    
    // Create dimension scores section
    const dimensionScores = document.createElement('div');
    dimensionScores.className = 'dimension-scores';
    
    const dimensionScoresTitle = document.createElement('h3');
    dimensionScoresTitle.id = 'dimension-scores-title';
    dimensionScoresTitle.textContent = strings.ui?.dimensionScoresTitle || 'Dimension Scores';
    dimensionScores.appendChild(dimensionScoresTitle);
    
    const dimensionScoresList = document.createElement('div');
    dimensionScoresList.id = 'dimension-scores-list';
    dimensionScores.appendChild(dimensionScoresList);
    
    resultsSection.appendChild(dimensionScores);
    
    // Create strengths and weaknesses section
    const strengthsWeaknesses = document.createElement('div');
    strengthsWeaknesses.className = 'strengths-weaknesses';
    
    // Strengths section
    const strengths = document.createElement('div');
    strengths.className = 'strengths';
    
    const strengthsTitle = document.createElement('h3');
    strengthsTitle.id = 'strengths-title';
    strengthsTitle.textContent = strings.ui?.strengthsTitle || 'Your Strengths';
    strengths.appendChild(strengthsTitle);
    
    const strengthsList = document.createElement('ul');
    strengthsList.id = 'strengths-list';
    strengths.appendChild(strengthsList);
    
    // Weaknesses section
    const weaknesses = document.createElement('div');
    weaknesses.className = 'weaknesses';
    
    const weaknessesTitle = document.createElement('h3');
    weaknessesTitle.id = 'weaknesses-title';
    weaknessesTitle.textContent = strings.ui?.weaknessesTitle || 'Areas for Development';
    weaknesses.appendChild(weaknessesTitle);
    
    const weaknessesList = document.createElement('ul');
    weaknessesList.id = 'weaknesses-list';
    weaknesses.appendChild(weaknessesList);
    
    strengthsWeaknesses.appendChild(strengths);
    strengthsWeaknesses.appendChild(weaknesses);
    resultsSection.appendChild(strengthsWeaknesses);
    
    // Create career paths section
    const careerPaths = document.createElement('div');
    careerPaths.className = 'career-paths';
    
    const careerPathsTitle = document.createElement('h3');
    careerPathsTitle.id = 'career-paths-title';
    careerPathsTitle.textContent = strings.ui?.careerPathsTitle || 'Suggested Career Paths';
    careerPaths.appendChild(careerPathsTitle);
    
    const careerPathsIntro = document.createElement('p');
    careerPathsIntro.id = 'career-paths-intro';
    careerPathsIntro.textContent = strings.ui?.careerPathsIntro || 'Based on your current competencies, these career paths might be a good fit:';
    careerPaths.appendChild(careerPathsIntro);
    
    const careerPathsList = document.createElement('ul');
    careerPathsList.id = 'career-paths-list';
    careerPaths.appendChild(careerPathsList);
    
    const careerPathsDisclaimer = document.createElement('p');
    careerPathsDisclaimer.id = 'career-paths-disclaimer';
    careerPathsDisclaimer.style.fontStyle = 'italic';
    careerPathsDisclaimer.style.fontSize = '0.9em';
    careerPathsDisclaimer.style.marginTop = '1rem';
    careerPathsDisclaimer.textContent = strings.ui?.careerPathsDisclaimer || "Note: This list is not exhaustive. If you'd like to see additional roles added, please contact us at info@locessentials.com";
    careerPaths.appendChild(careerPathsDisclaimer);
    
    resultsSection.appendChild(careerPaths);
    
    // Create next steps section
    const nextSteps = document.createElement('div');
    nextSteps.className = 'next-steps';
    
    const nextStepsTitle = document.createElement('h3');
    nextStepsTitle.id = 'next-steps-title';
    nextStepsTitle.textContent = strings.ui?.nextStepsTitle || 'Recommended Next Steps';
    nextSteps.appendChild(nextStepsTitle);
    
    const nextStepsIntro = document.createElement('p');
    nextStepsIntro.id = 'next-steps-intro';
    nextStepsIntro.textContent = strings.ui?.nextStepsIntro || 'To further develop your localization management skills:';
    nextSteps.appendChild(nextStepsIntro);
    
    const nextStepsList = document.createElement('ul');
    nextStepsList.id = 'next-steps-list';
    nextSteps.appendChild(nextStepsList);
    
    resultsSection.appendChild(nextSteps);
    
    // Create action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    const printBtn = document.createElement('button');
    printBtn.id = 'print-results';
    printBtn.textContent = strings.ui?.printResults || 'Print Results';
    actionButtons.appendChild(printBtn);
    
    // const emailBtn = document.createElement('button');
    // emailBtn.id = 'email-results';
    // emailBtn.textContent = strings.ui?.emailResults || 'Email Results';
    // actionButtons.appendChild(emailBtn);
    
    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-evaluation';
    resetBtn.textContent = strings.ui?.resetEvaluation || 'Start Over';
    actionButtons.appendChild(resetBtn);
    
    resultsSection.appendChild(actionButtons);
}

// Set up event handlers and remaining functionality
function setupEventHandlers(strings) {
    // Chart data and configuration
    let resultsChart;
    
    // Get DOM elements
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-evaluation');
    const printBtn = document.getElementById('print-results');
    // const emailBtn = document.getElementById('email-results');
    const evaluationForm = document.getElementById('evaluation-form');
    const resultsSection = document.getElementById('results');
    const evaluationSection = document.getElementById('evaluation');
    
    // Use the shared dimension structure
    const dimensionStructure = createDimensionStructure(strings);
    
    // Career paths based on different skill combinations
    const careerPaths = {};
    const requirements = window.careerPathsConfig?.careerPathRequirements || {};
    const names = strings.careerPathNames || {};

    for (const pathId in requirements) {
        careerPaths[pathId] = {
            name: names[pathId] || pathId,
            requirements: requirements[pathId]
        };
    }
    
    // Development recommendation fallbacks for each dimension
    const developmentRecommendations = {
        'language': getNestedProperty(strings, 'recommendations.language') || 'Improve your proficiency in additional languages.',
        'research': getNestedProperty(strings, 'recommendations.research') || 'Develop analytical skills through research projects.',
        'market': getNestedProperty(strings, 'recommendations.market') || 'Follow industry publications and learn about standards.',
        'subject': getNestedProperty(strings, 'recommendations.subject') || 'Focus on a specific industry and develop expertise.',
        'gilt': getNestedProperty(strings, 'recommendations.gilt') || 'Gain experience in practical translation and localization projects.',
        'technology': getNestedProperty(strings, 'recommendations.technology') || 'Familiarize yourself with CAT tools and machine translation.',
        'management': getNestedProperty(strings, 'recommendations.management') || 'Take formal project management courses or certification.'
    };
    
    // Show evaluation section initially
    if (evaluationSection) {
        evaluationSection.classList.remove('hidden');
    }
    
    // Calculate button click handler
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            // Validate form
            if (!validateForm()) {
                alert(getNestedProperty(strings, 'alerts.incomplete') || 'Please complete all ratings before calculating results.');
                return;
            }
            
            // Calculate scores
            const scores = calculateScores();
            
            // Display results
            displayResults(scores);
            
            // Hide evaluation form, show results
            if (evaluationSection) evaluationSection.classList.add('hidden');
            if (resultsSection) resultsSection.classList.remove('hidden');
            
            // Scroll to top of results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        console.error("Calculate button not found");
    }
    
    // Reset button click handler
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Reset form
            if (evaluationForm) evaluationForm.reset();
            
            // Show evaluation form, hide results
            if (evaluationSection) evaluationSection.classList.remove('hidden');
            if (resultsSection) resultsSection.classList.add('hidden');
            
            // Destroy chart if it exists
            if (resultsChart) {
                resultsChart.destroy();
            }
        });
    }
    
    // Print button click handler
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Email button click handler
    // if (emailBtn) {
    //     emailBtn.addEventListener('click', function() {
    //         // This would normally connect to an email service
    //         // For the purpose of this example, we'll just show an alert
    //         alert(getNestedProperty(strings, 'alerts.email') || 'Email functionality not yet implemented');
    //     });
    // }
    
    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Check all competencies in all dimensions
        for (const dimensionKey in dimensionStructure) {
            const dimension = dimensionStructure[dimensionKey];
            
            for (const competency of dimension.competencies) {
                const radioButtons = document.getElementsByName(competency);
                let competencyChecked = false;
                
                for (const radioButton of radioButtons) {
                    if (radioButton.checked) {
                        competencyChecked = true;
                        break;
                    }
                }
                
                if (!competencyChecked) {
                    isValid = false;
                    break;
                }
            }
            
            if (!isValid) break;
        }
        
        return isValid;
    }
    
    // Calculate scores for all dimensions
    function calculateScores() {
        const scores = {};
        
        // Calculate average score for each dimension
        for (const dimensionKey in dimensionStructure) {
            const dimension = dimensionStructure[dimensionKey];
            let dimensionTotal = 0;
            let competencyCount = 0;
            
            // Store individual competency scores for this dimension
            scores[dimensionKey] = {
                name: dimension.name,
                average: 0,
                competencies: {}
            };
            
            // Calculate total for dimension
            for (const competency of dimension.competencies) {
                const radioButtons = document.getElementsByName(competency);
                
                for (const radioButton of radioButtons) {
                    if (radioButton.checked) {
                        const value = parseInt(radioButton.value);
                        dimensionTotal += value;
                        scores[dimensionKey].competencies[competency] = value;
                        competencyCount++;
                        break;
                    }
                }
            }
            
            // Calculate average score for dimension
            scores[dimensionKey].average = dimensionTotal / competencyCount;
        }
        
        return scores;
    }
    
    // Display results
    function displayResults(scores) {
        // Create dimension scores list
        const dimensionScoresList = document.getElementById('dimension-scores-list');
        if (!dimensionScoresList) {
            console.error("Cannot find 'dimension-scores-list' element");
            return;
        }
        dimensionScoresList.innerHTML = '';
        
        // Create arrays for chart data
        const labels = [];
        const data = [];
        const strengthsList = document.getElementById('strengths-list');
        const weaknessesList = document.getElementById('weaknesses-list');
        
        // Reset lists if they exist
        if (strengthsList) strengthsList.innerHTML = '';
        if (weaknessesList) weaknessesList.innerHTML = '';
        
        // Find top 3 strengths and weaknesses
        const sortedDimensions = Object.keys(scores).map(key => {
            return {
                key: key,
                name: scores[key].name,
                average: scores[key].average
            };
        }).sort((a, b) => b.average - a.average);
        
        // Display dimension scores and populate chart data
        for (const dimensionKey in scores) {
            const dimension = scores[dimensionKey];
            
            // Add to chart data
            labels.push(dimension.name);
            data.push(dimension.average.toFixed(1));
            
            // Create dimension score item
            const scoreItem = document.createElement('div');
            scoreItem.className = 'dimension-score-item';
            
            const scoreName = document.createElement('span');
            scoreName.className = 'dimension-score-name';
            scoreName.textContent = dimension.name;
            
            const scoreValue = document.createElement('span');
            scoreValue.className = 'dimension-score-value';
            scoreValue.textContent = dimension.average.toFixed(1) + '/5';
            
            scoreItem.appendChild(scoreName);
            scoreItem.appendChild(scoreValue);
            dimensionScoresList.appendChild(scoreItem);
        }
        
        // Add all strengths (dimensions with score 4 or above)
        if (strengthsList) {
            const strengths = sortedDimensions.filter(dimension => dimension.average >= 4);
            
            if (strengths.length === 0) {
                const emergingCompetenciesItem = document.createElement('li');
                emergingCompetenciesItem.textContent = getNestedProperty(strings, 'results.emergingCompetencies') || 
                    'You\'re building your foundation across all dimensions. Focus on areas that align with your career goals.';
                strengthsList.appendChild(emergingCompetenciesItem);
            } else {
                for (const dimension of strengths) {
                    const strengthItem = document.createElement('li');
                    strengthItem.textContent = `${dimension.name}: ${dimension.average.toFixed(1)}/5`;
                    strengthsList.appendChild(strengthItem);
                }
            }
        }
        
        // Add all areas for improvement (dimensions with score below 4)
        if (weaknessesList) {
            const improvements = sortedDimensions.filter(dimension => dimension.average < 4);
            
            if (improvements.length === 0) {
                const ongoingGrowthItem = document.createElement('li');
                ongoingGrowthItem.textContent = getNestedProperty(strings, 'results.ongoingGrowth') || 
                    'Excellent! All dimensions score 4 or above. You have strong competencies across the board.';
                weaknessesList.appendChild(ongoingGrowthItem);
            } else {
                for (const dimension of improvements) {
                    const weaknessItem = document.createElement('li');
                    weaknessItem.textContent = `${dimension.name}: ${dimension.average.toFixed(1)}/5`;
                    weaknessesList.appendChild(weaknessItem);
                }
            }
        }
            
        // Create radar chart
        createChart(labels, data);
        
        // Display career path recommendations
        displayCareerPaths(scores);
        
        // Display development recommendations for all areas that need improvement (score < 4)
        const areasForImprovement = sortedDimensions.filter(dimension => dimension.average < 4);
        displayDevelopmentRecommendations(areasForImprovement);
    }
    
    // Create radar chart for results
    function createChart(labels, data) {
        const chartElement = document.getElementById('results-chart');
        if (!chartElement) {
            console.error("Cannot find 'results-chart' element");
            return;
        }
        
        const ctx = chartElement.getContext('2d');
        if (!ctx) {
            console.error("Cannot get 2D context from 'results-chart' element");
            return;
        }
        
        // Destroy previous chart if it exists
        if (resultsChart) {
            resultsChart.destroy();
        }
        
        try {
            // Try to create new chart if Chart.js is available
            if (typeof Chart !== 'undefined') {
                // Calculate device pixel ratio for better resolution
                const dpr = window.devicePixelRatio || 1;
                
                // Set canvas to be higher resolution
                const rect = chartElement.getBoundingClientRect();
                chartElement.width = rect.width * dpr;
                chartElement.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                
                resultsChart = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: getNestedProperty(strings, 'chart.score') || 'Competency Score',
                            data: data,
                            backgroundColor: 'rgba(52, 152, 219, 0.2)',
                            borderColor: 'rgba(52, 152, 219, 1)',
                            pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(52, 152, 219, 1)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        devicePixelRatio: dpr,
                        elements: {
                            line: {
                                borderWidth: 3
                            }
                        },
                        scales: {
                            r: {
                                angleLines: {
                                    display: true
                                },
                                suggestedMin: 0,
                                suggestedMax: 5,
                                pointLabels: {
                                    font: {
                                        size: 14 // Larger, clearer labels
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: 14
                                    }
                                }
                            }
                        }
                    }
                });
                
                console.log("Chart created successfully");
            } else {
                console.error("Chart.js is not available");
                const chartContainer = chartElement.parentElement;
                if (chartContainer) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'chart-error';
                    errorMsg.textContent = 'Chart visualization is not available';
                    chartContainer.appendChild(errorMsg);
                }
            }
        } catch (error) {
            console.error("Error creating chart:", error);
        }
    }
    
    // Display career path recommendations
    function displayCareerPaths(scores) {
        const careerPathsList = document.getElementById('career-paths-list');
        if (!careerPathsList) {
            console.error("Cannot find 'career-paths-list' element");
            return;
        }
        
        careerPathsList.innerHTML = '';
        
        const matchingPaths = [];
        
        // Check each career path against user's scores
        for (const pathKey in careerPaths) {
            const path = careerPaths[pathKey];
            let matches = true;
            
            // Check if user meets all requirements for this path
            for (const reqDimension in path.requirements) {
                const requiredScore = path.requirements[reqDimension];
                
                // Find corresponding dimension in user scores
                for (const scoreDimension in scores) {
                    if (scoreDimension === reqDimension || 
                        (dimensionStructure[scoreDimension] && 
                         dimensionStructure[scoreDimension].competencies.includes(reqDimension))) {
                        if (scores[scoreDimension].average < requiredScore) {
                            matches = false;
                        }
                        break;
                    }
                }
                
                if (!matches) break;
            }
            
            if (matches) {
                matchingPaths.push(path.name);
            }
        }
        
        try {
            // If no matching paths, show generic message
            if (matchingPaths.length === 0) {
                const noPathsItem = document.createElement('li');
                noPathsItem.textContent = getNestedProperty(strings, 'careerPathNames.none') || 
                    'Continue developing your skills in weaker areas to match specific career paths.';
                careerPathsList.appendChild(noPathsItem);
            } else {
                // Add matching paths to list
                for (const pathName of matchingPaths) {
                    const pathItem = document.createElement('li');
                    pathItem.textContent = pathName;
                    careerPathsList.appendChild(pathItem);
                }
            }
        } catch (error) {
            console.error("Error displaying career paths:", error);
        }
    }
    
    // Display development recommendations
    function displayDevelopmentRecommendations(weakestDimensions) {
        const nextStepsList = document.getElementById('next-steps-list');
        if (!nextStepsList) {
            console.error("Cannot find 'next-steps-list' element");
            return;
        }
        
        nextStepsList.innerHTML = '';
        
        try {
            // Check if user is a high performer (all dimensions 4+)
            if (weakestDimensions.length === 0) {
                // Display high performer recommendations
                const highPerformerRec = getNestedProperty(strings, 'recommendations.highPerformer') || 
                    'Excellent work! Continue to maintain and grow your expertise across all dimensions.';
                
                const recItem = document.createElement('li');
                recItem.innerHTML = highPerformerRec;
                nextStepsList.appendChild(recItem);
            } else {
                // Add recommendations for each dimension that needs improvement
                for (const dimension of weakestDimensions) {
                    const recommendationKey = dimension.key;
                    if (developmentRecommendations[recommendationKey]) {
                        const recItem = document.createElement('li');
                        recItem.innerHTML = `<strong>${dimension.name}:</strong> ${developmentRecommendations[recommendationKey]}`;
                        nextStepsList.appendChild(recItem);
                    }
                }
            }
        } catch (error) {
            console.error("Error displaying development recommendations:", error);
        }
    }

}

// NOW we export the functions to the global window object
// IMPORTANT: This must be done AFTER the functions are defined
window.buildEvaluationSection = buildEvaluationSection;
window.buildResultsSection = buildResultsSection;
window.setupEventHandlers = setupEventHandlers;
