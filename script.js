document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader Logic ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('preloader-hidden');
    });

    // --- Lenis Smooth Scroll & Parallax ---
    const lenis = new Lenis({
        lerp: 0.07, // Lower values create a smoother, more 'floaty' scroll
        wheelMultiplier: 0.8, // Slightly reduce scroll speed
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    lenis.on('scroll', (e) => {
      // Parallax effect for the background
      document.body.style.setProperty('--scroll', e.animatedScroll / (e.dimensions.scrollHeight - e.dimensions.height));
      document.body.style.backgroundPosition = `center ${e.animatedScroll * 0.5}px`;
    });


    // --- Navigation Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section');
    const topNavLinks = document.querySelectorAll('.top-nav li');
    let isScrolling = false;

    const navObserver = new IntersectionObserver((entries) => {
        if (isScrolling) return;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                topNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.querySelector('a').getAttribute('href').substring(1) === id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => {
        navObserver.observe(section);
    });
    
    // --- Click to Open Nav & Smooth Scroll ---
    topNavLinks.forEach(clickedItem => {
        const link = clickedItem.querySelector('a');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            
            isScrolling = true;
            topNavLinks.forEach(item => {
                item.classList.remove('active');
            });
            clickedItem.classList.add('active');
            
            lenis.scrollTo(target, {
                duration: 1.5,
                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
                onComplete: () => {
                    isScrolling = false;
                }
            });
        });
    });


    // --- Fade-in Animation on Scroll ---
    const hiddenElements = document.querySelectorAll('.hidden');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.15 });

    hiddenElements.forEach((el) => scrollObserver.observe(el));

    // --- Typing Animation ---
    const typingTextElement = document.getElementById('typing-text');
    const textsToType = ["Cloud & DevOps Engineer", "AWS & Azure Specialist", "Security Focused"];
    let textIndex = 0;
    let charIndex = 0;

    function type() {
        if (charIndex < textsToType[textIndex].length) {
            typingTextElement.textContent += textsToType[textIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 2000);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typingTextElement.textContent = textsToType[textIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            textIndex = (textIndex + 1) % textsToType.length;
            setTimeout(type, 500);
        }
    }
    
    type();
    
    // --- Skill Modal Logic ---
    const skillModal = document.getElementById('skill-modal');
    const modalSkillName = document.getElementById('modal-skill-name');
    const modalSkillDescription = document.getElementById('modal-skill-description');
    
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', () => {
            modalSkillName.textContent = card.dataset.skill;
            modalSkillDescription.textContent = card.dataset.description;
            skillModal.classList.add('visible');
        });
    });
    
    // --- Code Preview Modal ---
    const codeModal = document.getElementById('code-modal');
    const modalRepoName = document.getElementById('modal-repo-name');
    const codePreview = document.getElementById('code-preview');
    
    document.querySelectorAll('.code-preview-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const repo = e.target.dataset.repo;
            modalRepoName.textContent = repo;
            codePreview.textContent = 'Loading...';
            codeModal.classList.add('visible');
            
            try {
                const response = await fetch(`https://api.github.com/repos/${repo}/readme`);
                if (!response.ok) throw new Error('README not found.');
                const data = await response.json();
                codePreview.textContent = atob(data.content);
            } catch (error) {
                codePreview.textContent = `Could not fetch README: ${error.message}`;
            }
        });
    });
    
    // --- Generic Modal Close Logic ---
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const hideModal = () => {
            modal.classList.remove('visible');
        };
        closeBtn.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('visible'));
        }
    });
    
    
    // --- Contact Form Logic ---
    const contactOptions = document.getElementById('contact-options');
    const hireForm = document.getElementById('hire-form');
    const freelanceForm = document.getElementById('freelance-form');
    const formMessage = document.getElementById('form-message');
    const budgetSlider = document.getElementById('budget-slider');
    const budgetValue = document.getElementById('budget-value');

    contactOptions.addEventListener('click', (e) => {
        if (e.target.matches('.action-btn')) {
            contactOptions.style.display = 'none';
            const formId = e.target.getAttribute('data-form');
            if (formId === 'hire-form') {
                hireForm.style.display = 'flex';
            } else if (formId === 'freelance-form') {
                freelanceForm.style.display = 'flex';
            }
        }
    });

    const handleFormSubmit = (form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            
            // Start sending animation
            submitButton.disabled = true;
            submitButton.classList.add('sending-state');
            formMessage.textContent = "Sending...";
            formMessage.style.color = "#e0e0e0";

            const formData = new FormData(form);
            const object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                const result = await response.json();

                if (result.success) {
                    // Trigger success animation
                    submitButton.classList.remove('sending-state');
                    submitButton.classList.add('success-state');
                    formMessage.textContent = "Thank you! Your message has been sent successfully.";
                    formMessage.style.color = "#00aaff";
                    
                    setTimeout(() => {
                        form.style.display = 'none';
                        form.reset();
                        contactOptions.style.display = 'flex';
                        formMessage.textContent = "";
                        // Reset button for next time
                        submitButton.disabled = false;
                        submitButton.classList.remove('success-state');
                    }, 4000);
                } else {
                    // Throw an error to be caught by the catch block
                    throw new Error(result.message || "Something went wrong. Please try again.");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                // Trigger error animation
                submitButton.classList.remove('sending-state');
                submitButton.classList.add('error-state');
                formMessage.textContent = error.message;
                formMessage.style.color = "#ff4d4d";
                
                // Reset button after showing error state
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.classList.remove('error-state');
                }, 2500);
            }
        });
    };

    handleFormSubmit(hireForm);
    handleFormSubmit(freelanceForm);
    
    budgetSlider.addEventListener('input', () => {
        budgetValue.textContent = `$${parseInt(budgetSlider.value).toLocaleString()}`;
    });
    
    // --- Download Resume Animation ---
    const downloadBtn = document.getElementById('download-resume-btn');
    
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (downloadBtn.classList.contains('downloading')) {
            return;
        }
        
        downloadBtn.classList.add('downloading');
        
        setTimeout(() => {
            downloadBtn.classList.remove('downloading');
        }, 2500);
    });
    
    // --- Side Menu Logic ---
    const menuTrigger = document.querySelector('.menu-trigger');
    
    const isTouchDevice = () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isTouchDevice()) {
        menuTrigger.addEventListener('click', () => {
            document.body.classList.toggle('side-menu-open');
        });
    } else {
        menuTrigger.addEventListener('mouseenter', () => {
            document.body.classList.add('side-menu-open');
        });
        menuTrigger.addEventListener('mouseleave', () => {
            document.body.classList.remove('side-menu-open');
        });
    }
    
    // --- Smooth Scroll for Hero CTA ---
    const heroCta = document.querySelector('.hero-cta');
    heroCta.addEventListener('click', (e) => {
         e.preventDefault();
         const target = heroCta.getAttribute('href');
         lenis.scrollTo(target, {
            duration: 1.5,
            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        });
    });
    
    // --- View More Logic (FIXED) ---
    document.querySelectorAll('.view-more-btn').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            const hiddenItems = document.querySelectorAll(`.hidden-${section}`);
            
            if (button.textContent === 'View More') {
                hiddenItems.forEach(item => {
                    item.classList.add('show');
                });
                button.textContent = 'View Less';
            } else {
                // This is the new, fixed logic for "View Less"
                const parentSection = button.closest('section');
                if (parentSection) {
                    lenis.scrollTo(parentSection, {
                        duration: 1.2,
                        easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
                        onComplete: () => {
                            hiddenItems.forEach(item => {
                                item.classList.remove('show');
                            });
                            button.textContent = 'View More';
                        }
                    });
                } else {
                    // Fallback just in case
                    hiddenItems.forEach(item => {
                        item.classList.remove('show');
                    });
                    button.textContent = 'View More';
                }
            }
        });
    });
    
    // --- YouTube Player Logic ---
    let player;
    const heroVisual = document.querySelector('.hero-visual');
    const pauseBtn = document.getElementById('video-pause-btn');

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: 'dQw4w9WgXcQ', // Placeholder video
            playerVars: { 'autoplay': 0, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1 },
        });
    }

    heroVisual.addEventListener('click', () => {
        heroVisual.classList.toggle('flipped');
        if (heroVisual.classList.contains('flipped')) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    });
    
    pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        player.pauseVideo();
        heroVisual.classList.remove('flipped');
    });
    
    // --- Tech Facts Logic ---
    const techFactElement = document.getElementById('tech-fact');
    const techFacts = [
        "AWS was launched in 2006, making it one of the first major cloud providers.",
        "Azure is the second-largest cloud provider and is owned by Microsoft.",
        "Google Cloud Platform (GCP) is known for its expertise in data analytics and machine learning.",
        "Serverless computing allows you to run code without provisioning or managing servers.",
        "Containers, like Docker, package an application and its dependencies into a single object.",
        "The term 'cloud' was first used in the context of computing in the early 1990s.",
        "AWS S3 is designed for 99.999999999% (11 nines) of durability.",
        "Multi-cloud is the use of two or more cloud computing services from different providers.",
        "Hybrid cloud combines a private cloud with one or more public cloud services.",
        "Edge computing brings computation and data storage closer to the sources of data.",
        "Kubernetes, an open-source container orchestration system, was originally designed by Google.",
        "The global cloud computing market is expected to reach over $1 trillion by 2028.",
        "AWS has a global network of 'Availability Zones' for high availability and fault tolerance.",
        "Azure Arc allows you to manage resources across multiple clouds and on-premises environments.",
        "Cloud gaming services like Google Stadia and NVIDIA GeForce NOW stream games to your device.",
        "Infrastructure as Code (IaC) tools like Terraform allow you to manage infrastructure with configuration files.",
        "The three main service models of cloud computing are IaaS, PaaS, and SaaS.",
        "A VPC (Virtual Private Cloud) is a secure, isolated private cloud hosted within a public cloud.",
        "Cloud-native applications are designed specifically to run in a cloud computing environment.",
        "A CDN (Content Delivery Network) is a network of servers that deliver content to users from a nearby location.",
        "AWS Lambda was one of the first commercially available serverless computing platforms.",
        "Azure Functions is Microsoft's serverless compute service.",
        "Google Cloud Functions is Google's serverless compute offering.",
        "Cloud security is a shared responsibility between the cloud provider and the customer.",
        "A firewall is a network security device that monitors and filters incoming and outgoing network traffic.",
        "An NSG (Network Security Group) in Azure contains security rules that allow or deny network traffic.",
        "IAM (Identity and Access Management) is a framework of policies and technologies for ensuring that the right users have the appropriate access to technology resources.",
        "CloudFormation is AWS's service for modeling and setting up AWS resources.",
        "Azure Resource Manager (ARM) is the deployment and management service for Azure.",
        "A load balancer distributes network traffic across multiple servers to ensure no single server becomes overwhelmed.",
        "Autoscaling automatically adjusts the number of compute resources in your application based on demand.",
        "A database is an organized collection of data, generally stored and accessed electronically from a computer system.",
        "A relational database, like MySQL or PostgreSQL, stores data in tables with rows and columns.",
        "A NoSQL database, like MongoDB or DynamoDB, provides a mechanism for storage and retrieval of data that is modeled in means other than the tabular relations used in relational databases.",
        "A data warehouse is a large store of data accumulated from a wide range of sources within a company and used to guide management decisions.",
        "A data lake is a centralized repository that allows you to store all your structured and unstructured data at any scale.",
        "Machine learning is a type of artificial intelligence (AI) that allows software applications to become more accurate at predicting outcomes without being explicitly programmed to do so.",
        "Deep learning is a subset of machine learning based on artificial neural networks.",
        "An API (Application Programming Interface) is a set of rules and protocols for building and interacting with software applications.",
        "A RESTful API is an architectural style for an application program interface (API) that uses HTTP requests to access and use data.",
        "GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.",
        "A webhook is an automated message sent from apps when something happens.",
        "CI/CD (Continuous Integration/Continuous Delivery) is a method to frequently deliver apps to customers by introducing automation into the stages of app development.",
        "DevOps is a set of practices that combines software development (Dev) and IT operations (Ops).",
        "Git is a distributed version control system for tracking changes in source code during software development.",
        "GitHub is a provider of Internet hosting for software development and version control using Git.",
        "A virtual machine (VM) is a virtual emulation of a computer system.",
        "A hypervisor is software that creates and runs virtual machines.",
        "The two main types of hypervisors are Type 1 (bare-metal) and Type 2 (hosted).",
        "Cloud monitoring is the process of reviewing and managing the operational workflow and processes within a cloud infrastructure."
    ];
    let factIndex = 0;
    
    const changeFact = () => {
        techFactElement.style.opacity = 0;
        setTimeout(() => {
            factIndex = (factIndex + 1) % techFacts.length;
            techFactElement.textContent = techFacts[factIndex];
            techFactElement.style.opacity = 1;
        }, 500);
    };
    
    if(techFactElement) {
        changeFact();
        setInterval(changeFact, 5000);
    }
    
    // --- AI Description Generator ---
    const generateDescBtn = document.getElementById('generate-description-btn');
    const keywordsInput = document.getElementById('ai-keywords');
    const descriptionTextarea = document.getElementById('freelance-description');
    
    generateDescBtn.addEventListener('click', () => {
        const keywords = keywordsInput.value;
        if (!keywords) {
            descriptionTextarea.value = "Please enter some keywords first.";
            return;
        }
        
        generateDescBtn.textContent = 'Generating...';
        generateDescBtn.disabled = true;
        
        // Simulated AI response
        setTimeout(() => {
            descriptionTextarea.value = `This project involves creating a ${keywords} solution. Key deliverables include setting up a scalable cloud infrastructure, ensuring robust security measures, and developing an intuitive user interface. The goal is to build a high-performance application that meets all business requirements.`;
            generateDescBtn.textContent = '✨ Generate with AI';
            generateDescBtn.disabled = false;
        }, 1500);
    });
    
    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const icons = darkModeToggle.querySelectorAll('.material-symbols-outlined');
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        icons.forEach(icon => icon.classList.toggle('hidden-icon'));
    });

    // --- Custom Cursor Logic ---
    let clientX = -100;
    let clientY = -100;
    const innerCursor = document.querySelector(".cursor--small");

    const initCursor = () => {
        document.addEventListener("mousemove", e => {
            clientX = e.clientX;
            clientY = e.clientY;
        });

        const render = () => {
            innerCursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    };

    let lastX = 0;
    let lastY = 0;
    let isStuck = false;
    let stuckX, stuckY;
    let group;

    const initCanvas = () => {
        const canvas = document.querySelector(".cursor--canvas");
        paper.setup(canvas);
        
        const strokeColor = "rgba(0, 170, 255, 0.5)";
        const strokeWidth = 1;
        const segments = 8;
        const radius = 15;
        
        const polygon = new paper.Path.RegularPolygon(
            new paper.Point(0, 0),
            segments,
            radius
        );
        polygon.strokeColor = strokeColor;
        polygon.strokeWidth = strokeWidth;
        polygon.smooth();
        group = new paper.Group([polygon]);
        group.applyMatrix = false;

        const lerp = (a, b, n) => {
            return (1 - n) * a + n * b;
        };

        paper.view.onFrame = event => {
            if (!isStuck) {
                lastX = lerp(lastX, clientX, 0.2);
                lastY = lerp(lastY, clientY, 0.2);
                group.position = new paper.Point(lastX, lastY);
            } else {
                lastX = lerp(lastX, stuckX, 0.2);
                lastY = lerp(lastY, stuckY, 0.2);
                group.position = new paper.Point(lastX, lastY);
            }
        }
    }

    const initHovers = () => {
        const handleMouseEnter = e => {
            const navItem = e.currentTarget;
            const navItemBox = navItem.getBoundingClientRect();
            stuckX = Math.round(navItemBox.left + navItemBox.width / 2);
            stuckY = Math.round(navItemBox.top + navItemBox.height / 2);
            isStuck = true;
        };

        const handleMouseLeave = () => {
            isStuck = false;
        };

        const hoverables = document.querySelectorAll(
            'a, button, .skill-card, .flip-card-inner, .menu-trigger'
        );

        hoverables.forEach(item => {
            item.addEventListener("mouseenter", handleMouseEnter);
            item.addEventListener("mouseleave", handleMouseLeave);
        });
    };

    initCursor();
    initCanvas();
    initHovers();
});